import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        // baseUrl: 'http://localhost:5000/api',
        baseUrl: 'https://doorcarbn.onrender.com/api',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Car', 'User', 'Booking'],
    endpoints: (builder) => ({
        // Auth
        login: builder.mutation({
            query: (credentials) => ({
                url: '/users/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        // Cars
        getCars: builder.query({
            query: (params) => ({
                url: '/cars',
                params,
            }),
            providesTags: ['Car'],
        }),
        addCar: builder.mutation({
            query: (formData) => ({
                url: '/cars/add-with-images',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Car'],
        }),
        updateCar: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/cars/${id}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Car'],
        }),
        deleteCar: builder.mutation({
            query: (id) => ({
                url: `/cars/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Car'],
        }),
        // Stats
        getCarById: builder.query({
            query: (id) => `/cars/${id}`,
            providesTags: (result, error, id) => [{ type: 'Car', id }],
        }),
        getUsers: builder.query({
            query: (params) => ({
                url: '/users',
                params,
            }),
            providesTags: ['User'],
        }),
        getUserById: builder.query({
            query: (id) => `/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),
        updateUserStatus: builder.mutation({
            query: ({ id, isActive }) => ({
                url: `/users/${id}/status`,
                method: 'PUT',
                body: { isActive },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),
        verifyUserDocument: builder.mutation({
            query: ({ id, type, status, rejectionReason }) => ({
                url: `/users/${id}/verify-document`,
                method: 'PUT',
                body: { type, status, rejectionReason },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),
        getAllBookings: builder.query({
            query: (params) => ({
                url: '/bookings/all-bookings',
                method: 'GET',
                params,
            }),
            providesTags: ['Bookings'],
        }),
        getBookingById: builder.query({
            query: (id) => `/bookings/${id}`,
            providesTags: (result, error, id) => [{ type: 'Bookings', id }],
        }),
        getDashboardStats: builder.query({
            query: (params) => ({
                url: '/admin/stats',
                params,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useGetCarsQuery,
    useAddCarMutation,
    useUpdateCarMutation,
    useDeleteCarMutation,
    useGetUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserStatusMutation,
    useVerifyUserDocumentMutation,
    useGetAllBookingsQuery,
    useGetCarByIdQuery,
    useGetBookingByIdQuery,
    useGetDashboardStatsQuery,
} = apiSlice;
