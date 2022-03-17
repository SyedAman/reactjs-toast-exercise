/**
 * Blackbox testing for Toast component.
 * 
 * Blackbox tests:
 * If you pass true to open prop, snackbar should show.".
 * If you pass false to open prop, snackbar should not show.
 * Edge case: Open prop is not a required prop. If you pass nothing to open prop, snackbar should not show.
 * 
 * If you pass onLike callback, onLike should be called when the like button is clicked.
 * Edge case: onLike is not a required prop. If you don't pass onLike callback, nothing should happen.
 * 
 * If you pass onClose callback, onClose should be called when the close button is clicked.
 * Edge case: onClose is not a required prop. If you don't pass onClick callback, nothing should happen.
 * 
 * Edge case: lastSubmittedForm is not a required prop, by default display "First Lastname email.address@domain.com".
 * If you pass firstName lastName and email then it should display "{firstName} {lastName} {email}".
 */

import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'

import Toast from './Toast';
 
test('If you pass true to open prop, snackbar should show.', () => {
    render(<Toast open={true} />);
    expect(screen.queryAllByText('First Lastname email.address@domain.com')).toBeDefined();
});

test('If you pass false to open prop, snackbar should not show.', () => {
    render(<Toast open={false} />);
    expect(screen.queryByText('First Lastname email.address@domain.com')).toBeNull();
});

test('Edge case: Open prop is not a required prop. If you pass nothing to open prop, snackbar should not show.', () => {
    render(<Toast />);
    expect(screen.queryByText('First Lastname email.address@domain.com')).toBeNull();
});

test('If you pass onLike callback, onLike should be called when the like button is clicked.', () => {
    const mockedOnLike = jest.fn();
    render(<Toast open={true} onLike={mockedOnLike}/>);
    fireEvent.click(screen.queryByRole('button', {name: /LIKE/i}));
    expect(mockedOnLike).toBeCalledTimes(1);
})

test("Edge case: onLike is not a required prop. If you don't pass onLike callback, nothing should happen.", () => {
    render(<Toast onLike={undefined} />);
});

test('If you pass onClose callback, onClose should be called when the close button is clicked.', () => {
    const mockedOnClose = jest.fn();
    render(<Toast open={true} onClose={mockedOnClose}/>);
    const button = screen.queryByRole('button', {name: /close/i});
    fireEvent.click(button);
    expect(mockedOnClose).toBeCalledTimes(1);
})

test("Edge case: onLike is not a required prop. If you don't pass onLike callback, nothing should happen.", () => {
    render(<Toast onClose={undefined} />);
});

test('Edge case: lastSubmittedForm is not a required prop, by default display "First Lastname email.address@domain.com".', () => {
    render(<Toast open={true} lastSubmittedForm={undefined} />);
    const text = screen.queryByText('First Lastname email.address@domain.com');
    expect(text).toBeInTheDocument();
});

test('If you pass firstName lastName and email then it should display "{firstName} {lastName} {email}".', () => {
    const mockSubmittedForm = {
        id: 'testid',
        data: {
          email: 'testEmail@domain.com',
          firstName: 'testFirst',
          lastName: 'testLast',
          liked: false,
        }
    };
    render(<Toast open={true} lastSubmittedForm={mockSubmittedForm} />);
    const text = screen.queryByText('testFirst testLast testEmail@domain.com');
    expect(text).toBeInTheDocument();
});