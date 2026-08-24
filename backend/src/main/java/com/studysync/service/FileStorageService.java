package com.studysync.service;
import com.studysync.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
@Service
public class FileStorageService {
 private final Path root;
 public FileStorageService(@Value("${app.upload-dir}") String uploadDir){root=Paths.get(uploadDir).toAbsolutePath().normalize();}
 public String storeProfileImage(MultipartFile file){if(file.isEmpty()||file.getSize()>2_000_000)throw new BadRequestException("Image must be between 1 byte and 2 MB");if(file.getContentType()==null||!Set.of("image/jpeg","image/png","image/webp").contains(file.getContentType()))throw new BadRequestException("Only JPEG, PNG, and WebP images are allowed");try{Files.createDirectories(root);String extension=Objects.requireNonNullElse(file.getOriginalFilename(),"image.png").replaceAll("^.*(\\.[A-Za-z0-9]+)$","$1");String name=UUID.randomUUID()+extension;Files.copy(file.getInputStream(),root.resolve(name),StandardCopyOption.REPLACE_EXISTING);return "/uploads/"+name;}catch(IOException e){throw new BadRequestException("Could not save profile image");}}
}
