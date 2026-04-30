#!/usr/bin/env python3
"""
Migration script to add class_level column to users table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from database import engine, db_available

def add_class_level_column():
    """Add class_level column to users table"""
    if not db_available:
        print("Database not available")
        return False
    
    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'class_level'
            """))
            
            if result.fetchone():
                print("class_level column already exists")
                return True
            
            # Add the column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN class_level VARCHAR(10)
            """))
            
            # Set default class_level for existing students (set to '12' for testing)
            conn.execute(text("""
                UPDATE users 
                SET class_level = '12' 
                WHERE role = 'student' AND class_level IS NULL
            """))
            
            conn.commit()
            print("Successfully added class_level column to users table")
            return True
            
    except Exception as e:
        print(f"Error adding class_level column: {e}")
        return False

if __name__ == "__main__":
    success = add_class_level_column()
    sys.exit(0 if success else 1)
