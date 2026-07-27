package com.soft.ecommerce.service.impl;

import com.soft.ecommerce.exception.APIException;
import com.soft.ecommerce.exception.ResourceNotFoundException;
import com.soft.ecommerce.model.Cart;
import com.soft.ecommerce.model.Category;
import com.soft.ecommerce.model.Product;
import com.soft.ecommerce.model.User;
import com.soft.ecommerce.payload.CartDTO;
import com.soft.ecommerce.payload.PageResponse;
import com.soft.ecommerce.payload.ProductDTO;
import com.soft.ecommerce.repository.CartRepository;
import com.soft.ecommerce.repository.CategoryRepository;
import com.soft.ecommerce.repository.ProductRepository;
import com.soft.ecommerce.service.api.CartService;
import com.soft.ecommerce.service.api.FileService;
import com.soft.ecommerce.service.api.ProductService;
import com.soft.ecommerce.utils.AuthUtil;
import com.soft.ecommerce.utils.RefactorMethods;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ModelMapper modelMapper;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartServiceImpl cartServiceImpl;
    private final CartRepository cartRepository;
    private final FileService fileService;
    private final AuthUtil authUtil;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository,
                              ModelMapper modelMapper, CartServiceImpl cartServiceImpl, CartRepository cartRepository, FileService fileService, AuthUtil authUtil) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.modelMapper = modelMapper;
        this.cartServiceImpl = cartServiceImpl;
        this.cartRepository = cartRepository;
        this.fileService = fileService;
        this.authUtil = authUtil;
    }

    private ProductDTO mapToDtoWithImage(Product product) {
        ProductDTO dto = modelMapper.map(product, ProductDTO.class);
        return dto;
    }

    private ProductDTO mapToDto(Product product) {
        return modelMapper.map(product, ProductDTO.class);
    }


    @Override
    public ProductDTO addProduct(Long categoryId, ProductDTO productDTO) {
        Category category = categoryRepository.findById(categoryId)
                                              .orElseThrow( () -> new ResourceNotFoundException("Category", "id", categoryId) );

        boolean isProductPresent = category.getProducts().stream()
                                                         .anyMatch(p -> p.getName().equalsIgnoreCase(productDTO.getName()) );
        if(isProductPresent)
            throw new APIException("Product with name " + productDTO.getName() + " already exists in category " + category.getName());

        Product product = modelMapper.map(productDTO, Product.class);
        product.setUser(authUtil.loggedInUser());
        product.setImage("");
        product.setCategory(category);
        if(product.getDiscount() == null) product.setDiscount(0.0);
        if(product.getSpecialPrice() == null){ //auto specialPrice
            Double specialPrice = product.getPrice() - ( product.getDiscount() * 0.01 * product.getPrice() );
            product.setSpecialPrice(specialPrice);
        }
        Product addedProduct = productRepository.save(product);
        return mapToDto(addedProduct);
    }

    @Override
    public PageResponse<ProductDTO> findAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder, String keyword, String category) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Specification<Product> spec = (root, cq, cb) -> cb.conjunction();

        if ( category != null && !category.isEmpty() ) {
            spec = spec.and((root, cq, cb) ->
                              cb.like(root.get("category").get("name"), category));
        }
        if( keyword != null && !keyword.isEmpty() ) {
            spec = spec.and( (root, cq, cb) ->
                              cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
        }

        Page<Product> productPage =  productRepository.findAll(spec, pageDetails);
        return RefactorMethods.getPageResponse(productPage,
                                               this::mapToDtoWithImage,
                                       "NO PRODUCTS HAVE BEEN ADDED YET");
    }

    @Override
    public PageResponse<ProductDTO> findAllProductsForAdmin(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Product> productPage = productRepository.findAll(pageDetails);
        return RefactorMethods.getPageResponse(productPage,
                                               this::mapToDtoWithImage,
                                       "NO PRODUCTS HAVE BEEN ADDED YET");
    }

    @Override
    public PageResponse<ProductDTO> findAllProductsForSeller(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);

        User user = authUtil.loggedInUser();
        Page<Product> productPage = productRepository.findByUser(user, pageDetails);
        return RefactorMethods.getPageResponse(productPage,
                                               this::mapToDtoWithImage,
                                  "NO PRODUCTS HAVE BEEN ADDED YET");
    }

    @Override
    public PageResponse<ProductDTO> findProductsByCategory(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                                              .orElseThrow( () -> new ResourceNotFoundException("Category", "id", categoryId) );

        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Product> productPage = productRepository.findByCategoryOrderByPriceAsc(category, pageDetails);

        return RefactorMethods.getPageResponse(productPage,
                                               this::mapToDto,
                                  "Category " + category.getName() + " doesn't have any products yet");
    }

    @Override
    public PageResponse<ProductDTO> findProductsByKeyword(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Pageable pageDetails = RefactorMethods.buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Product> productPage = productRepository.findByNameContainingIgnoreCase(keyword, pageDetails);

        return RefactorMethods.getPageResponse(productPage,
                                               this::mapToDto,
                                  "No products found with keyword: " + keyword);
    }

    @Override
    public ProductDTO updateProduct(Long productId, ProductDTO productDTO) {
        Product foundedProduct = productRepository.findById(productId)
                                                  .orElseThrow( () -> new ResourceNotFoundException("Product", "id", productId) );

        Product prodChanges = modelMapper.map(productDTO, Product.class);

        foundedProduct.setName(prodChanges.getName());
        foundedProduct.setDescription(prodChanges.getDescription());
        foundedProduct.setQuantity(prodChanges.getQuantity());
        foundedProduct.setPrice(prodChanges.getPrice());
        foundedProduct.setDiscount(prodChanges.getDiscount());
        foundedProduct.setSpecialPrice(prodChanges.getSpecialPrice());

        Product updatedProduct = productRepository.save(foundedProduct);

        List<Cart> carts = cartRepository.findAllByProductId(productId);

        List<CartDTO> cartDTOs = carts.stream()
                                      .map(c-> cartServiceImpl.cartToCartDTO(c))
                                      .toList();

        cartDTOs.forEach(cartDTO -> cartServiceImpl.updateProductInCarts(cartDTO.getId(), productId));

        return mapToDto(updatedProduct);
    }

    @Override
    public ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException {
        Product foundedProduct = productRepository
                                 .findById(productId)
                                 .orElseThrow( () -> new ResourceNotFoundException("Product", "id", productId) );
        String imageUrl = fileService.uploadImage(image);
        foundedProduct.setImage(imageUrl);
        Product updatedProduct = productRepository.save(foundedProduct);
        return mapToDto(updatedProduct);
    }

    @Override
    public ProductDTO deleteProduct(Long productId) {
        Product foundedProduct = productRepository
                                 .findById(productId)
                                 .orElseThrow( () -> new ResourceNotFoundException("Product", "id", productId) );
        //carts
        List<Cart> carts = cartRepository.findAllByProductId(productId);
        carts.forEach(cart -> cartServiceImpl.deleteProductFromCart(cart.getId(), productId));

        productRepository.delete(foundedProduct);
        return mapToDto(foundedProduct);
    }

}
