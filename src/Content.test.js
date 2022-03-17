/**
 * Blackbox testing for Content component.
 * 
 * Blackbox tests:
 * Should have heading called "Liked Form Submissions".
 * An empty array of likedSubmissions should result in no list items.
 * An array of 5 likedSubmissions should result in 5 list items.
 * An array with the first likedSubmission of the form { id: 'test', data: { firstName: 't', lastName: 'e' } } should
 * result in "{id} | {firstName} | {lastName}"
 */

import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom'

import Content from './Content';

test('Should have heading called "Liked Form Submissions".', () => {
    render(<Content likedForms={[]} />);
    expect(screen.queryByRole('heading')).toHaveTextContent('Liked Form Submissions');
});

test('An empty array of likedSubmissions should result in no list items.', () => {
    render(<Content likedForms={[]} />);
    expect(screen.queryByRole('p')).toBeNull();
});
  