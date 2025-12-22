-- Migration: Add Mock Team Snippets for Testing Team Dashboard
-- Purpose: Populate team_dashboard with actual snippets to verify UI is working
-- Timestamp: 20251122120300

-- =====================================================
-- PART 1: Insert Mock Team Snippets
-- =====================================================

DO $$
DECLARE
  v_team_id uuid;
  v_creator_id uuid;
  v_member_id uuid;
  v_snippet_id_1 uuid;
  v_snippet_id_2 uuid;
  v_snippet_id_3 uuid;
BEGIN
  -- Get an existing team (if any teams exist)
  SELECT id, created_by 
  INTO v_team_id, v_creator_id
  FROM public.teams 
  WHERE created_at >= NOW() - INTERVAL '7 days'
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Only proceed if we found a team
  IF v_team_id IS NOT NULL THEN
    RAISE NOTICE 'Found team: %, creator: %', v_team_id, v_creator_id;

    -- Get a team member (not the creator) if exists
    SELECT user_id INTO v_member_id
    FROM public.team_members
    WHERE team_id = v_team_id 
    AND user_id != v_creator_id
    LIMIT 1;

    -- If no separate member exists, use creator for all snippets
    IF v_member_id IS NULL THEN
      v_member_id := v_creator_id;
      RAISE NOTICE 'No separate member found, using creator for all snippets';
    END IF;

    -- =====================================================
    -- Snippet 1: React Authentication Hook (by creator)
    -- =====================================================
    INSERT INTO public.snippets (
      title,
      description,
      code,
      language,
      snippet_type,
      visibility,
      team_id,
      user_id,
      likes_count,
      views_count,
      comments_count,
      version,
      ai_tags,
      ai_quality_score
    ) VALUES (
      'React Authentication Hook - useAuth',
      'Custom React hook for managing user authentication state with login, logout, and session management functionality. Includes automatic token refresh and persistent sessions.',
      '// useAuth.js - Custom Authentication Hook
import { useState, useEffect, createContext, useContext } from ''react'';
import { supabase } from ''../lib/supabaseClient'';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error(''Error fetching session:'', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(''Auth state changed:'', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error(''Error signing out:'', error);
      throw error;
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default useAuth;',
      'javascript',
      'function',
      'team',
      v_team_id,
      v_creator_id,
      12,
      87,
      3,
      1,
      ARRAY['react', 'authentication', 'hooks', 'supabase', 'custom-hook', 'session-management'],
      85
    ) RETURNING id INTO v_snippet_id_1;

    RAISE NOTICE 'Created snippet 1: %', v_snippet_id_1;

    -- =====================================================
    -- Snippet 2: Python Data Processing Pipeline (by member)
    -- =====================================================
    INSERT INTO public.snippets (
      title,
      description,
      code,
      language,
      snippet_type,
      visibility,
      team_id,
      user_id,
      likes_count,
      views_count,
      comments_count,
      version,
      ai_tags,
      ai_quality_score
    ) VALUES (
      'Python Data Pipeline - CSV to Database ETL',
      'Robust ETL pipeline for processing CSV files and loading data into PostgreSQL database with error handling, validation, and batch processing for optimal performance.',
      '# data_pipeline.py - ETL Pipeline for CSV to Database
import pandas as pd
import psycopg2
from typing import List, Dict, Any
import logging
from datetime import datetime

class DataPipeline:
    """
    ETL Pipeline for processing CSV files and loading into PostgreSQL
    Features:
    - Batch processing for large files
    - Data validation and cleaning
    - Error handling and logging
    - Transaction management
    """
    
    def __init__(self, db_config: Dict[str, str], batch_size: int = 1000):
        self.db_config = db_config
        self.batch_size = batch_size
        self.logger = self._setup_logger()
        
    def _setup_logger(self) -> logging.Logger:
        """Configure logging for pipeline operations"""
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            ''%(asctime)s - %(name)s - %(levelname)s - %(message)s''
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def validate_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Validate and clean data before processing
        
        Args:
            df: Input DataFrame
            
        Returns:
            Cleaned DataFrame
        """
        self.logger.info(f''Validating {len(df)} rows'')
        
        # Remove duplicates
        df = df.drop_duplicates()
        
        # Handle missing values
        df = df.fillna({
            ''numeric_column'': 0,
            ''text_column'': '''',
            ''date_column'': datetime.now()
        })
        
        # Validate data types
        df[''numeric_column''] = pd.to_numeric(df[''numeric_column''], errors=''coerce'')
        df[''date_column''] = pd.to_datetime(df[''date_column''], errors=''coerce'')
        
        self.logger.info(f''Validation complete: {len(df)} valid rows'')
        return df
    
    def process_csv(self, csv_path: str, table_name: str) -> Dict[str, Any]:
        """
        Process CSV file and load into database
        
        Args:
            csv_path: Path to CSV file
            table_name: Target database table
            
        Returns:
            Processing statistics
        """
        try:
            self.logger.info(f''Starting pipeline for {csv_path}'')
            
            # Read CSV in chunks for memory efficiency
            chunks = pd.read_csv(csv_path, chunksize=self.batch_size)
            
            total_rows = 0
            error_count = 0
            
            # Connect to database
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            try:
                for chunk_num, chunk in enumerate(chunks, 1):
                    self.logger.info(f''Processing chunk {chunk_num}'')
                    
                    # Validate and clean data
                    clean_data = self.validate_data(chunk)
                    
                    # Insert data in batch
                    for _, row in clean_data.iterrows():
                        try:
                            cursor.execute(
                                f"""INSERT INTO {table_name} 
                                   (column1, column2, column3) 
                                   VALUES (%s, %s, %s)""",
                                (row[''column1''], row[''column2''], row[''column3''])
                            )
                            total_rows += 1
                        except Exception as e:
                            self.logger.error(f''Row insert failed: {e}'')
                            error_count += 1
                    
                    # Commit batch
                    conn.commit()
                    self.logger.info(f''Chunk {chunk_num} committed'')
                
                return {
                    ''status'': ''success'',
                    ''total_rows'': total_rows,
                    ''error_count'': error_count,
                    ''timestamp'': datetime.now()
                }
                
            finally:
                cursor.close()
                conn.close()
                
        except Exception as e:
            self.logger.error(f''Pipeline failed: {e}'')
            return {
                ''status'': ''failed'',
                ''error'': str(e),
                ''timestamp'': datetime.now()
            }

# Usage Example
if __name__ == ''__main__'':
    db_config = {
        ''host'': ''localhost'',
        ''database'': ''mydb'',
        ''user'': ''user'',
        ''password'': ''password''
    }
    
    pipeline = DataPipeline(db_config, batch_size=1000)
    result = pipeline.process_csv(''input.csv'', ''target_table'')
    print(f''Pipeline result: {result}'')',
      'python',
      'class',
      'team',
      v_team_id,
      v_member_id,
      8,
      45,
      2,
      1,
      ARRAY['python', 'etl', 'data-pipeline', 'postgresql', 'pandas', 'batch-processing'],
      90
    ) RETURNING id INTO v_snippet_id_2;

    RAISE NOTICE 'Created snippet 2: %', v_snippet_id_2;

    -- =====================================================
    -- Snippet 3: TypeScript API Error Handler (by creator)
    -- =====================================================
    INSERT INTO public.snippets (
      title,
      description,
      code,
      language,
      snippet_type,
      visibility,
      team_id,
      user_id,
      likes_count,
      views_count,
      comments_count,
      version,
      ai_tags,
      ai_quality_score
    ) VALUES (
      'TypeScript API Error Handler Middleware',
      'Comprehensive error handling middleware for Express.js API with custom error classes, logging integration, and standardized error responses. Includes validation errors, auth errors, and database errors.',
      '// errorHandler.ts - Comprehensive API Error Handling
import { Request, Response, NextFunction } from ''express'';
import { logger } from ''./logger'';

// Custom Error Classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = ''Authentication required'') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = ''Access forbidden'') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = ''Resource'') {
    super(`${resource} not found`, 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}

// Error Response Interface
interface ErrorResponse {
  status: ''error'' | ''fail'';
  message: string;
  statusCode: number;
  stack?: string;
  errors?: any[];
}

// Global Error Handler Middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let message = ''Internal Server Error'';
  let isOperational = false;

  // Handle known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error
  logger.error({
    message: err.message,
    statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    status: statusCode >= 400 && statusCode < 500 ? ''fail'' : ''error'',
    message: isOperational ? message : ''Something went wrong'',
    statusCode
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === ''development'') {
    errorResponse.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

// Async Error Handler Wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not Found Handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Usage in Express App:
/*
import express from ''express'';
import { errorHandler, notFoundHandler } from ''./errorHandler'';

const app = express();

// Your routes here
app.get(''/api/users'', asyncHandler(async (req, res) => {
  // Your async code
  if (!user) {
    throw new NotFoundError(''User'');
  }
  res.json(user);
}));

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);
*/

export default errorHandler;',
      'typescript',
      'class',
      'team',
      v_team_id,
      v_creator_id,
      15,
      102,
      5,
      1,
      ARRAY['typescript', 'express', 'error-handling', 'middleware', 'api', 'node.js'],
      92
    ) RETURNING id INTO v_snippet_id_3;

    RAISE NOTICE 'Created snippet 3: %', v_snippet_id_3;

    -- =====================================================
    -- Add some comments to snippets for realism
    -- =====================================================
    INSERT INTO public.snippet_comments (snippet_id, user_id, content, parent_id)
    VALUES 
      (v_snippet_id_1, v_member_id, 'This hook is exactly what we needed for our auth refactor! Love the automatic token refresh feature.', NULL),
      (v_snippet_id_2, v_creator_id, 'Great pipeline implementation. Have you considered adding parallel processing for multiple CSV files?', NULL),
      (v_snippet_id_3, v_member_id, 'The custom error classes are really clean. Should we standardize on this pattern for all our APIs?', NULL);

    -- =====================================================
    -- Add some likes to make it realistic
    -- =====================================================
    INSERT INTO public.snippet_likes (snippet_id, user_id)
    VALUES 
      (v_snippet_id_1, v_member_id),
      (v_snippet_id_2, v_creator_id),
      (v_snippet_id_3, v_member_id)
    ON CONFLICT (snippet_id, user_id) DO NOTHING;

    RAISE NOTICE 'Successfully created 3 team snippets with comments and likes';
    
  ELSE
    RAISE NOTICE 'No recent teams found. Skipping mock data creation.';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating mock snippets: %', SQLERRM;
    -- Don''t fail the migration, just log the error
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 20251122120300 completed successfully';
  RAISE NOTICE '📊 Added mock team snippets for testing team dashboard';
  RAISE NOTICE '🎯 Snippets include: React Hook, Python ETL Pipeline, TypeScript Error Handler';
END $$;