from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from config import settings
from routers import contractors
from routers import stripe_routes
from routers import coupons

app = FastAPI(
    title="Smart Asset AI API",
    description="建物修繕・管理プラットフォーム API",
    version="1.0.0",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(contractors.router, prefix="/api/contractors", tags=["contractors"])
app.include_router(stripe_routes.router)
app.include_router(coupons.router)


@app.get("/")
async def root():
    return {"message": "Smart Asset AI API", "version": "1.0.0", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
