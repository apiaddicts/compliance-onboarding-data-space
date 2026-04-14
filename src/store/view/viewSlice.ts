import { createSlice } from '@reduxjs/toolkit'

import { InitialStateViewInterface } from '@/interfaces'


const getInitialState = (): InitialStateViewInterface => {
  return {
    view: 'HOME'
  }
}

export const viewSlice = createSlice({
  name: 'auth',
  initialState: getInitialState,
  reducers: {
    changeView: (state, action) => {
      state.view = action.payload
    }
  }
})
export const { changeView } = viewSlice.actions
export default viewSlice.reducer
