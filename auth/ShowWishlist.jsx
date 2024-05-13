import React, { useState, useEffect } from 'react';
import serverHost from '../../utils/host';

const ShowWishlist = () => {
  const userId = sessionStorage.getItem('userId');
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await fetch(`${serverHost}:4000/favorites`, {
          headers: {
            'user_id': userId
          }
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setWishlistItems(data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlistItems();
  }, [userId]);

  return (
    <div>
      <h1>찜목록</h1>
      <ul>
        {wishlistItems.map(item => (
          <li key={item.id}>
            <strong>{item.product_name}</strong> - {item.price ? item.price.toLocaleString() + '원' : '가격 정보 없음'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowWishlist;