import React from 'react';

const FibonacciDivs: React.FC = () => {
    // Function to generate Fibonacci numbers
    const generateFibonacci = (n: number): number[] => {
        const fib = [1, 1]; // Start with the first two numbers of Fibonacci
        for (let i = 2; i < n; i++) {
            fib[i] = fib[i - 1] + fib[i - 2];
        }
        return fib;
    };

    // Generate the first 10 Fibonacci numbers for example
    const fibonacciNumbers = generateFibonacci(10);

    // Recursive function to render nested divs
    const renderDivs = (index: number): JSX.Element => {
        if (index >= fibonacciNumbers.length) return <></>;

        const size = fibonacciNumbers[index];

        return (
            <div
                style={{
                    width: `${size * 10}px`,
                    height: `${size * 10}px`,
                    border: '2px solid black',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '10px',
                }}
            >
                {renderDivs(index + 1)}
            </div>
        );
    };

    return <div>{renderDivs(0)}</div>;
};

export default FibonacciDivs;
