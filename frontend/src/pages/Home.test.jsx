import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './Home';

vi.mock('@/components/HeroCarousel', () => ({
  default: () => <div>HeroCarousel</div>,
}));

vi.mock('@/components/Marquee', () => ({
  default: () => <div>Marquee</div>,
}));

vi.mock('@/components/BrowseCategories', () => ({
  default: () => <div>BrowseCategories</div>,
}));

vi.mock('@/components/BestSellers', () => ({
  default: () => <div>BestSellers</div>,
}));

vi.mock('@/components/OnSaleProducts', () => ({
  default: () => <div>OnSaleProducts</div>,
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the storefront sections', () => {
    render(<Home />);

    expect(screen.getByText('HeroCarousel')).toBeInTheDocument();
    expect(screen.getByText('Marquee')).toBeInTheDocument();
    expect(screen.getByText('BrowseCategories')).toBeInTheDocument();
    expect(screen.getByText('BestSellers')).toBeInTheDocument();
    expect(screen.getByText('OnSaleProducts')).toBeInTheDocument();
  });
});
