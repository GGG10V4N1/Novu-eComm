package com.soft.ecommerce.service.api;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileService {
    String uploadImage(MultipartFile file) throws IOException;

}
