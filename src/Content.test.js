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
import Chance from 'chance';

import Content from './Content';

const chance = new Chance();

test('Should have heading called "Liked Form Submissions".', () => {
    render(<Content likedForms={[]} />);
    expect(screen.queryByRole('heading')).toHaveTextContent('Liked Form Submissions');
});

test('An empty array of likedSubmissions should result in no list items.', () => {
    render(<Content likedForms={[]} />);
    expect(screen.queryByRole('p')).toBeNull();
});
  
test('An array of 5 likedSubmissions should result in 5 list items.', () => {
    const mockFormSubmission = {
        data: {
            email: 'testEmail',
            firstName: 'testFirst',
            lastName: 'testLast',
            liked: true
        }
    };
    const mockLikedForms = [...Array(5)].map((elem, i) => ({...mockFormSubmission, id: `testId${i}`}));
    render(<Content likedForms={mockLikedForms} />);
    expect(document.getElementsByTagName('p')).toHaveLength(5);
});

test("List items should be of the form result in '{id} | {firstName} | {lastName}'", () => {
    const mockLikedForms = [{id:'test',data:{firstName:'t',lastName:'e'}}];
    render(<Content likedForms={mockLikedForms} />);
    expect(screen.getByText('test | t | e')).toBeInTheDocument();
});