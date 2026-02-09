from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Dict, Any, Optional
from uuid import UUID
from infrastructure.dependencies import get_repository, get_pipeline
from ports.repository import RepositoryPort
from domain.services.pipeline import CognitivePipeline
from domain.models import Product
from pydantic import BaseModel
from i18n import t, get_language_from_header
import uuid

router = APIRouter(prefix="/products", tags=["Products"])

class ProductCreateRequest(BaseModel):
    title: str
    archetype: str # e.g., 'non_fiction', 'course'
    target_audience: str
    style_family: str # e.g., 'classic_publisher'
    seed_text: Optional[str] = None
    space_id: Optional[UUID] = None

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    request: ProductCreateRequest,
    pipeline: CognitivePipeline = Depends(get_pipeline),
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    lang = get_language_from_header(accept_language)
    
    product = Product(
        id=uuid.uuid4(),
        title=request.title,
        archetype=request.archetype,
        target_audience=request.target_audience,
        style_family=request.style_family,
        # status="concept", (defaults)
        space_id=request.space_id,
        language=lang # Persistent language for product content
    )
    
    # We might use pipeline to generate initial blueprint here
    # ...
    
    repo.create_product(product)
    return product

@router.get("/", response_model=List[Product])
def list_products(
    space_id: Optional[UUID] = None,
    repo: RepositoryPort = Depends(get_repository)
):
    return repo.list_products(space_id=space_id)

@router.get("/{product_id}", response_model=Product)
def get_product(
    product_id: UUID,
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    product = repo.get_product(product_id)
    if not product:
        lang = get_language_from_header(accept_language)
        raise HTTPException(status_code=404, detail=t("product_not_found", lang))
    return product
    
@router.post("/{product_id}/blueprint", response_model=Dict[str, Any])
async def generate_blueprint(
    product_id: UUID,
    pipeline: CognitivePipeline = Depends(get_pipeline),
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    lang = get_language_from_header(accept_language)
    product = repo.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=t("product_not_found", lang))

    try:
        # Trigger real blueprint generation using pipeline/LLM
        blueprint = await pipeline.generate_blueprint(product, language=lang)
        
        # TODO: Save blueprint to product (requires Product.blueprint field in domain model)
        # For now, return it directly
        
        return {
            "status": "blueprint_generated",
            "language": lang,
            "blueprint": blueprint
        }
    except Exception as e:
        print(f"Blueprint generation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating blueprint: {str(e)}")

@router.get("/{product_id}/export")
def export_product(
    product_id: UUID,
    format: str = "md",
    repo: RepositoryPort = Depends(get_repository),
    accept_language: str = Header(default="en", alias="Accept-Language")
):
    lang = get_language_from_header(accept_language)
    product = repo.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=t("product_not_found", lang))

    # Helper to recursively build text
    def build_markdown(sections: List[Any], level: int = 2) -> str:
        text = ""
        for section in sections:
            # Title
            prefix = "#" * level
            if section.title:
                text += f"{prefix} {section.title}\n\n"
            
            # Content
            if section.content:
                text += f"{section.content}\n\n"
            
            # Recurse
            if hasattr(section, 'subsections') and section.subsections:
                text += build_markdown(section.subsections, level + 1)
        return text

    def build_html(sections: List[Any], level: int = 2) -> str:
        html = ""
        for section in sections:
            # Title
            if section.title:
                html += f"<h{level}>{section.title}</h{level}>\n"
            
            # Content (simple paragraph wrapping, assumes content is plain text or simple markdown)
            # For robust implementation, we might want a markdown->html converter here if content is markdown.
            # But let's assume raw text for now or simple wrapping.
            if section.content:
                # Basic line break handling
                content_html = section.content.replace("\n", "<br>")
                html += f"<p>{content_html}</p>\n"
            
            # Recurse
            if hasattr(section, 'subsections') and section.subsections:
                html += build_html(section.subsections, level + 1)
        return html

    # Generate Content
    content = ""
    filename = f"{product.title.replace(' ', '_')}"
    media_type = "text/plain"

    if format == "md":
        content = f"# {product.title}\n\n"
        if hasattr(product, 'sections') and product.sections:
            content += build_markdown(product.sections)
        else:
             content += "_No sections content available._"
             
        filename += ".md"
        media_type = "text/markdown"

    elif format == "html":
        body = ""
        if hasattr(product, 'sections') and product.sections:
            body = build_html(product.sections)
        else:
            body = "<p><em>No sections content available.</em></p>"

        # Simple semantic CSS
        css = """
        <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
            h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
            h2 { color: #444; margin-top: 2rem; }
            p { margin-bottom: 1rem; }
        </style>
        """
        
        content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <title>{product.title}</title>
    {css}
</head>
<body>
    <h1>{product.title}</h1>
    {body}
</body>
</html>"""
        filename += ".html"
        media_type = "text/html"
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'md' or 'html'.")

    from fastapi.responses import Response
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
