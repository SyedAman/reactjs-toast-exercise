/**
 * Blackbox testing for App component.
 * 
 * Blackbox tests:
 */

import React from 'react';
import { screen, render } from '@testing-library/react';
import App from './App';

test('renders header text', () => {
  render(<App />);

  const heading  = screen.getByRole('heading', { name: /toast exercise/i});
  expect(heading).toBeInTheDocument();
});
