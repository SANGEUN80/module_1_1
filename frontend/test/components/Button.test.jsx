/**
 * @jest-environment jsdom
 * Feature: #002 - Button 컴포넌트
 * Domain: Components/UI
 * Method: Button
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/Button';

describe('Button 컴포넌트 테스트', () => {
  test('버튼이 정상적으로 렌더링됨', () => {
    render(<Button>클릭</Button>);

    const button = screen.getByRole('button', { name: /클릭/i });

    expect(button).toBeInTheDocument();
  });

  test('클릭 이벤트가 정상 동작함', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    const button = screen.getByRole('button', { name: /클릭/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabled 상태일 때 클릭이 불가능함', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>클릭</Button>);

    const button = screen.getByRole('button', { name: /클릭/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  test('variant prop에 따라 올바른 클래스가 적용됨', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByRole('button', { name: /Primary/i });
    expect(button).toHaveClass('btn-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /Secondary/i });
    expect(button).toHaveClass('btn-secondary');
  });

  test('size prop에 따라 올바른 클래스가 적용됨', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: /Small/i });
    expect(button).toHaveClass('btn-sm');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /Large/i });
    expect(button).toHaveClass('btn-lg');
  });
});
