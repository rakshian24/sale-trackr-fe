import { gql } from "@apollo/client";

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        shopName
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        shopName
        email
      }
    }
  }
`;

export const DASHBOARD_STATS = gql`
  query DashboardStats($filter: DashboardFilterInput!) {
    dashboardStats(filter: $filter) {
      cashAmount
      upiAmount
      totalAmount
      cashTransactions
      upiTransactions
      topSellingItems {
        itemName
        totalAmount
        transactionCount
      }
      recentTransactions {
        id
        itemSummary
        itemCount
        totalPrice
        paymentMode
        soldAt
      }
    }
  }
`;

export const SALES = gql`
  query Sales {
    sales {
      id
      product {
        id
      }
      itemName
      quantityValue
      quantityUnit
      paymentMode
      costPrice
      sellingPrice
      totalPrice
      soldAt
    }
  }
`;

export const CREATE_SALES = gql`
  mutation CreateSales($input: CreateSalesInput!) {
    createSales(input: $input) {
      id
    }
  }
`;

export const DELETE_SALE = gql`
  mutation DeleteSale($id: ID!) {
    deleteSale(id: $id)
  }
`;

export const CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const PRODUCTS = gql`
  query Products {
    products {
      id
      name
      pluNo
      sellingPrice
      quantityValue
      quantityUnit
      category {
        id
        name
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($term: String!) {
    searchProducts(term: $term) {
      id
      name
      sellingPrice
      quantityUnit
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      sellingPrice
      quantityUnit
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;
