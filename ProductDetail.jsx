import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/main.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`https://ec2caps.liroocapstone.shop:4000/products/detail/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('상품 상세 정보 가져오기 오류:', response.status);
        }
      } catch (error) {
        console.error('상품 상세 정보 가져오기 오류:', error);
      }
    };

    fetchProductDetail();
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
  <div className="product-detail">
   <h2 className="product-name">{product.name}</h2>
    <p className="product-description">{product.description}</p>
    <div className="product-info">
    <p className="product-price">Price: ${product.price}</p>
    <p className="product-date">Date: {new Date(product.createdAt).toLocaleDateString()}</p>
    </div>
  </div>


  );
};

export default ProductDetail;
