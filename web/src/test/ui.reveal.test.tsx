import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('reveal ui', () => {
  it('renders seat grid and progress text', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /狼人杀/i })).toBeInTheDocument()
    expect(screen.getByText(/身份查看进度：0\/8/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /座位/i }).length).toBe(8)
  })
})

