from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, groups, blockchain
from app.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chama API",
    description="Blockchain-powered rotating savings and credit association system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])

@app.get("/")
async def root():
    return {"message": "Chama API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
