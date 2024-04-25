import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header'; // Header 컴포넌트 임포트
import SearchResults from './SearchResults';
import ViewsList from './ViewsList';

const SearchResultsPage = () => {
  const { searchTerm } = useParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products?search=${searchTerm}`);
        if (response.ok) {
          const data = await response.json();

          // Assuming 'image' is the property name in the fetched data containing the image filename
          const updatedProducts = data.map(product => ({
            ...product,
            imageUrl: `http://localhost:4000/uploads/${product.image}` // Construct image URL
          }));

          setFilteredProducts(updatedProducts);
          setLoading(false);
        } else {
          console.error('Failed to fetch search results');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setLoading(false);
      }
    };

    // Invoke fetchSearchResults when the component mounts or when searchTerm changes
    fetchSearchResults();
  }, [searchTerm]);

  const handleProductClick = async (productId) => {
    try {
      // Update views count for the clicked product
      await fetch(`http://localhost:4000/updateViews/${productId}`, {
        method: 'POST',
      });

      // Navigate to the product detail page with the selected productId
      navigate(`/ProductDetail/${productId}`);
    } catch (error) {
      console.error('Error updating views or navigating to product detail:', error);
    }
  };

  return (
    <div>
      <Header /> {/* Header 컴포넌트 추가 */}
      <h2>검색 결과: {decodeURIComponent(searchTerm)}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <SearchResults
          filteredProducts={filteredProducts}
          onProductClick={handleProductClick}
        />
      )}
      <div className="related-products">
          <h2>연관 상품</h2>
          <ViewsList />
        </div>
    </div>
  );
};

export default SearchResultsPage;
