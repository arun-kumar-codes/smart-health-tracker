import request from 'supertest';
import app from '../src/app'; // Adjust the path to your app
import mongoose from 'mongoose';
import { setupDatabase, tearDownDatabase } from './databaseSetup'; // Custom setup for MongoDB

beforeAll(setupDatabase);
afterAll(tearDownDatabase);

describe('API Tests', () => {
  it('should fetch all items', async () => {
    const response = await request(app).get('/api/items');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should create a new item', async () => {
    const newItem = { name: 'Test Item', description: 'This is a test item' };
    const response = await request(app).post('/api/items').send(newItem);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newItem.name);
  });

  it('should return 404 for non-existing item', async () => {
    const response = await request(app).get('/api/items/123456789012345678901234'); // Non-existing ID
    expect(response.status).toBe(404);
  });
});

import { render, screen } from '@testing-library/react';
import App from '../src/App'; // Adjust the path to your App component

describe('Frontend Tests', () => {
  it('renders the main app component', () => {
    render(<App />);
    const linkElement = screen.getByText(/welcome/i);
    expect(linkElement).toBeInTheDocument();
  });

  it('displays error message on failed fetch', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Fetch failed'))
    );
    render(<App />);
    const errorMessage = await screen.findByText(/fetch failed/i);
    expect(errorMessage).toBeInTheDocument();
    global.fetch.mockRestore();
  });
});

import { gql } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import { server } from '../src/graphqlServer'; // Adjust the path to your GraphQL server

const { query, mutate } = createTestClient(server);

describe('GraphQL API Tests', () => {
  it('fetches items', async () => {
    const GET_ITEMS = gql`
      query {
        items {
          id
          name
        }
      }
    `;
    const res = await query({ query: GET_ITEMS });
    expect(res).toMatchSnapshot();
  });

  it('creates a new item', async () => {
    const CREATE_ITEM = gql`
      mutation($name: String!, $description: String!) {
        createItem(name: $name, description: $description) {
          id
          name
        }
      }
    `;
    const res = await mutate({
      mutation: CREATE_ITEM,
      variables: { name: 'New Item', description: 'New item description' },
    });
    expect(res.data.createItem.name).toBe('New Item');
  });
});