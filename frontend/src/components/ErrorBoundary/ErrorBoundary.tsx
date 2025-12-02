// src/components/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRefresh, faHome } from '@fortawesome/free-solid-svg-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors?.background || '#121212'};
  color: ${({ theme }) => theme.colors?.text || '#fff'};
  padding: 40px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: #ff6b6b;
  margin-bottom: 24px;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors?.text || '#fff'};
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#b3b3b3'};
  margin-bottom: 32px;
  max-width: 500px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  ${({ variant, theme }) => variant === 'primary' ? `
    background: linear-gradient(135deg, ${theme.colors?.accent || '#1DB954'}, #1ed760);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(29, 185, 84, 0.4);
    }
  ` : `
    background: ${theme.colors?.buttonBackground || 'rgba(0, 0, 0, 0.06)'};
    color: ${theme.colors?.buttonText || theme.colors?.text || '#0b0b0b'};
    border: 1px solid ${theme.colors?.buttonBackground || 'rgba(0, 0, 0, 0.1)'};
    
    &:hover {
      background: ${theme.name === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'};
      transform: translateY(-2px);
    }
  `}
`;

const ErrorDetails = styled.details`
  margin-top: 32px;
  text-align: left;
  max-width: 600px;
  width: 100%;
`;

const ErrorSummary = styled.summary`
  cursor: pointer;
  color: ${({ theme }) => theme.colors?.textSecondary || '#888'};
  font-size: 0.9rem;
  margin-bottom: 12px;
  
  &:hover {
    color: ${({ theme }) => theme.colors?.text || '#fff'};
  }
`;

const ErrorStack = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.8rem;
  color: #ff6b6b;
  white-space: pre-wrap;
  word-break: break-word;
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: In production, send to error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRefresh = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorIcon>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </ErrorIcon>
          
          <ErrorTitle>Something went wrong</ErrorTitle>
          
          <ErrorMessage>
            We're sorry, but something unexpected happened. 
            Please try refreshing the page or go back to the home page.
          </ErrorMessage>
          
          <ButtonGroup>
            <Button variant="primary" onClick={this.handleRefresh}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh Page
            </Button>
            <Button variant="secondary" onClick={this.handleGoHome}>
              <FontAwesomeIcon icon={faHome} />
              Go Home
            </Button>
          </ButtonGroup>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <ErrorSummary>Error Details (Development Only)</ErrorSummary>
              <ErrorStack>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </ErrorStack>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
