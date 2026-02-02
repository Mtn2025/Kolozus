from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4
from ports.repository import RepositoryPort
from infrastructure.dependencies import get_repository, get_ai_provider
from ports.ai_provider import AIProviderPort
from pydantic import BaseModel
from domain.models import Product, ProductSection, Archetype, StyleFamily

router = APIRouter(prefix="/products", tags=["Editorial Engine"])

class CreateProductRequest(BaseModel):
    title: str
    archetype: str = "non_fiction"
    style_family: str = "classic_publisher"
    space_id: UUID
    editorial_profile_id: Optional[UUID] = None

class AddSectionRequest(BaseModel):
    title: str
    parent_id: Optional[UUID] = None
    order_index: int = 0

class UpdateProductRequest(BaseModel):
    design_overrides: Optional[Dict[str, Any]] = None
    # Add other fields if needed

@router.patch("/{product_id}", response_model=Product)
async def update_product(
    product_id: UUID,
    payload: UpdateProductRequest,
    repo: RepositoryPort = Depends(get_repository)
):
    product = repo.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if payload.design_overrides is not None:
        product.design_overrides = payload.design_overrides
    
    return repo.update_product(product)

from domain.services.blueprinter import Blueprinter
from domain.services.formatter import Formatter
from fastapi.responses import HTMLResponse

@router.post("/", response_model=Product)
async def create_product(
    payload: CreateProductRequest,
    repo: RepositoryPort = Depends(get_repository)
):
    """Create a new editorial product draft with initial blueprint."""
    # 1. Create Product
    product = Product(
        id=uuid4(),
        title=payload.title,
        archetype=Archetype(payload.archetype),
        style_family=StyleFamily(payload.style_family),
        space_id=payload.space_id,
        editorial_profile_id=payload.editorial_profile_id
    )
    saved_product = repo.create_product(product)

    # 2. Generate Blueprint
    sections = Blueprinter.generate_structure(saved_product)

    # 3. Persist Sections
    # Note: In a real app this would be a transaction or batch insert.
    for section in sections:
        saved_section = repo.add_section(section)
        if section.subsections:
            for subsec in section.subsections:
                repo.add_section(subsec)
    
    return repo.get_product(saved_product.id)

@router.get("/", response_model=List[Product])
async def list_products(
    space_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """List products in a space."""
    return repo.list_products(space_id)

@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    product = repo.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/{product_id}/sections", response_model=ProductSection)
async def add_section(
    product_id: UUID,
    payload: AddSectionRequest,
    repo: RepositoryPort = Depends(get_repository)
):
    section = ProductSection(
        id=uuid4(),
        product_id=product_id,
        parent_id=payload.parent_id,
        title=payload.title,
        order_index=payload.order_index
    )
    return repo.add_section(section)

@router.get("/{product_id}/preview", response_class=HTMLResponse)
async def preview_product(
    product_id: UUID,
    repo: RepositoryPort = Depends(get_repository)
):
    """Render the full product as HTML based on its Style Family."""
    product = repo.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    html = Formatter.render_html(product)
    return html

@router.get("/{product_id}/export")
async def export_product(
    product_id: UUID,
    format: str = "html",
    repo: RepositoryPort = Depends(get_repository)
):
    """Export product in requested format (html, md)."""
    product = repo.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if format == "md":
        content = Formatter.render_markdown(product)
        media_type = "text/markdown"
        filename = f"{product.title}.md"
    else:
        content = Formatter.render_html(product)
        media_type = "text/html"
        filename = f"{product.title}.html"
        
    return HTMLResponse(content=content, media_type=media_type, headers={"Content-Disposition": f"attachment; filename={filename}"})

@router.post("/{product_id}/blueprint")
async def create_blueprint(
    product_id: UUID,
    repo: RepositoryPort = Depends(get_repository),
    ai: AIProviderPort = Depends(get_ai_provider)
):
    """Auto-generates sections for the product based on Space content."""
    bp = Blueprinter(repo, ai)
    try:
        sections = await bp.generate_structure(product_id)
        return sections
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
