class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:123@localhost:5432/verascan"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "dev-secret-key-change-later"