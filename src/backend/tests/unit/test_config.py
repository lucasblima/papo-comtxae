"""Unit tests for application configuration."""
import os
import pytest
from unittest.mock import patch


def test_database_name_selection():
    """Test that the correct database name is selected based on environment."""
    # Save original env variables
    original_env = os.environ.copy()
    
    try:
        # Test production environment
        os.environ["NODE_ENV"] = "production"
        os.environ["DATABASE_NAME"] = "test_prod_db"
        
        # Reimport to reload environment variables
        with patch.dict(os.environ, {"NODE_ENV": "production", "DATABASE_NAME": "test_prod_db"}):
            from main import DATABASE_NAME
            assert DATABASE_NAME == "test_prod_db"
        
        # Test test environment
        with patch.dict(os.environ, {"NODE_ENV": "test", "TEST_DATABASE_NAME": "test_test_db"}):
            from importlib import reload
            import main
            reload(main)
            assert main.DATABASE_NAME == "test_test_db"
        
        # Test development environment
        with patch.dict(os.environ, {"NODE_ENV": "development", "DEV_DATABASE_NAME": "test_dev_db"}):
            from importlib import reload
            import main
            reload(main)
            assert main.DATABASE_NAME == "test_dev_db"
            
    finally:
        # Restore original env variables
        os.environ.clear()
        os.environ.update(original_env)


def test_mongodb_url_validation():
    """Test that the application validates MongoDB URL presence."""
    original_env = os.environ.copy()
    
    try:
        # Test with MONGODB_URL not set
        if "MONGODB_URL" in os.environ:
            del os.environ["MONGODB_URL"]
            
        # Importing main should raise an error
        with pytest.raises(ValueError, match="MONGODB_URL não está configurado"):
            from importlib import reload
            import main
            reload(main)
            
    finally:
        # Restore original env variables
        os.environ.clear()
        os.environ.update(original_env) 