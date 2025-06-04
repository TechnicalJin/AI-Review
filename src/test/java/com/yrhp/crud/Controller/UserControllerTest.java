package com.yrhp.crud.Controller;

import com.yrhp.crud.controller.UserController;
import com.yrhp.crud.dao.ClientDao;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.model.UserDtls;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.ReviewGenerationLogRepository;
import com.yrhp.crud.repository.UserRepository;
import com.yrhp.crud.service.ReviewGeneratorService;
import com.yrhp.crud.dto.RegenerateReviewRequest;
import com.yrhp.crud.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private UserRepository userRepo;

    @Mock
    private ClientRepository clientRepo;

    @Mock
    private ReviewGeneratorService reviewGeneratorService;

    @Mock
    private ReviewGenerationLogRepository reviewLogRepository;

    @Mock
    private Model model;

    @Mock
    private Principal principal;

    @Mock
    private BindingResult bindingResult;

    private final String uploadDir = "/uploads";
    private final String resourceAccessUrl = "http://localhost/uploads/";

    @BeforeEach
    void setUp() throws NoSuchFieldException, IllegalAccessException {

        Field resourceAccessUrlField = UserController.class.getDeclaredField("resourceAccessUrl");
        resourceAccessUrlField.setAccessible(true);
        resourceAccessUrlField.set(userController, resourceAccessUrl);


        Field uploadDirField = UserController.class.getDeclaredField("uploadDir");
        uploadDirField.setAccessible(true);
        uploadDirField.set(userController, uploadDir);
    }

    @Test
    void testUserDetails_ModelAttribute() {
        String email = "test@example.com";
        UserDtls user = new UserDtls();
        user.setEmail(email);
        when(principal.getName()).thenReturn(email);
        when(userRepo.findByEmail(email)).thenReturn(user);

        userController.userDetails(model, principal);

        verify(model).addAttribute("user", user);
        verifyNoMoreInteractions(model);
    }

    @Test
    void testHomePage_Success() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("name").ascending());
        Page<Client> clientPage = new PageImpl<>(Collections.emptyList());
        when(clientRepo.findAll(pageable)).thenReturn(clientPage);

        String view = userController.home(model, 0, 10, "name");

        assertEquals("user/home", view);
        verify(model).addAttribute("clients", clientPage);
        verify(model).addAttribute("currentPage", 0);
        verify(model).addAttribute("pageSize", 10);
        verify(model).addAttribute("sortField", "name");
        verify(model).addAttribute("resourceURL", resourceAccessUrl);
    }

    @Test
    void testHomePage_SizeLimit() {
        Pageable pageable = PageRequest.of(0, 50, Sort.by("name").ascending());
        Page<Client> clientPage = new PageImpl<>(Collections.emptyList());
        when(clientRepo.findAll(pageable)).thenReturn(clientPage);

        String view = userController.home(model, 0, 100, "name");

        assertEquals("user/home", view);
        verify(clientRepo).findAll(pageable);
    }

    @Test
    void testCreateClient_Get() {
        String view = userController.createClient(model);

        assertEquals("user/create", view);
        verify(model).addAttribute(eq("clientDao"), any(ClientDao.class));
    }

    @Test
    void testSaveClient_Success() throws IOException {
        ClientDao clientDao = new ClientDao();
        clientDao.setName("Test Client");
        clientDao.setEmail("test@client.com");
        clientDao.setMobile("1234567890");
        clientDao.setReviewLink("");
        MockMultipartFile logo = new MockMultipartFile("logo", "logo.png", "image/png", "test".getBytes());
        clientDao.setLogo(logo);

        when(bindingResult.hasErrors()).thenReturn(false);
        when(clientRepo.findByName("Test Client")).thenReturn(Collections.emptyList());
        when(clientRepo.findByEmail("test@client.com")).thenReturn(Optional.empty());
        when(clientRepo.findByMobile("1234567890")).thenReturn(Optional.empty());

        String view = userController.saveClient(clientDao, bindingResult, model);

        assertEquals("redirect:/user/home", view);
        verify(clientRepo).save(any(Client.class));
    }

    @Test
    void testSaveClient_ValidationError() {
        ClientDao clientDao = new ClientDao();
        when(bindingResult.hasErrors()).thenReturn(true);

        String view = userController.saveClient(clientDao, bindingResult, model);

        assertEquals("user/create", view);
        verifyNoInteractions(clientRepo);
    }

    @Test
    void testSaveClient_DuplicateName() {
        ClientDao clientDao = new ClientDao();
        clientDao.setName("Test Client");
        when(bindingResult.hasErrors()).thenReturn(false);
        when(clientRepo.findByName("Test Client")).thenReturn(List.of(new Client()));

        String view = userController.saveClient(clientDao, bindingResult, model);

        assertEquals("user/create", view);
        verify(model).addAttribute("error", "A client with this name already exists");
    }

    @Test
    void testCheckDuplicate_Name() {
        when(clientRepo.existsByNameIgnoreCase("Test Client")).thenReturn(true);

        Map<String, Boolean> response = userController.checkDuplicate("Test Client", null, null, null);

        assertTrue(response.get("isDuplicate"));
    }

    @Test
    void testViewClient_Success() {
        Client client = new Client();
        client.setId(1);
        client.setName("Test Client");
        when(clientRepo.findByName("Test Client")).thenReturn(List.of(client));
        when(reviewGeneratorService.generateReview(1)).thenReturn("Generated Review");

        String view = userController.viewClient("Test-Client", model);

        assertEquals("user/view", view);
        verify(model).addAttribute("client", client);
        verify(model).addAttribute("clients", List.of(client));
        verify(model).addAttribute("review", "Generated Review");
    }

    @Test
    void testViewClient_NotFound() {
        when(clientRepo.findByName("Test Client")).thenReturn(Collections.emptyList());

        assertThrows(ResourceNotFoundException.class, () ->
                userController.viewClient("Test-Client", model));
    }

    @Test
    void testRegenerateReview_Success() {
        RegenerateReviewRequest request = new RegenerateReviewRequest();
        request.setSelectedTags(Arrays.asList("tag1", "tag2", "tag3"));
        request.setReviewLength("medium");
        when(reviewGeneratorService.generateReviewWithTags(1, request.getSelectedTags(), "medium", true))
                .thenReturn("Regenerated Review");

        String response = userController.regenerateReview(1, request);

        assertEquals("Regenerated Review", response);
    }

    @Test
    void testRegenerateReview_InsufficientTags() {
        RegenerateReviewRequest request = new RegenerateReviewRequest();
        request.setSelectedTags(Arrays.asList("tag1", "tag2"));

        assertThrows(IllegalArgumentException.class, () ->
                userController.regenerateReview(1, request));
    }

    @Test
    void testGenerateReview_WithTags() {
        List<String> tags = Arrays.asList("tag1", "tag2", "tag3");
        when(reviewGeneratorService.generateReviewWithTags(1, tags, "medium")).thenReturn("Tagged Review");

        String response = userController.generateReview(1, tags, "medium");

        assertEquals("Tagged Review", response);
    }

    @Test
    void testGenerateReview_WithoutTags() {
        when(reviewGeneratorService.generateReview(1)).thenReturn("Normal Review");

        String response = userController.generateReview(1, null, "medium");

        assertEquals("Normal Review", response);
    }

    @Test
    void testViewLogs_Success() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("timestamp").descending());
        Page<ReviewGenerationLog> logPage = new PageImpl<>(Collections.emptyList());
        when(reviewLogRepository.searchWithFilters(any(), any(), any(), any(), any(), any(), any(), eq(pageable)))
                .thenReturn(logPage);
        when(reviewLogRepository.findDistinctCompanyNames()).thenReturn(Arrays.asList("Company1", "Company2"));

        String view = userController.viewLogs(model, 0, 10, null, null, null, null, null, null, null);

        assertEquals("user/log_view", view);
        verify(model).addAttribute("logs", logPage);
        verify(model).addAttribute("distinctCompanies", Arrays.asList("Company1", "Company2"));
    }

    @Test
    void testSubmitReview_Success() {
        Client client = new Client();
        client.setId(1);
        when(clientRepo.findById(1)).thenReturn(Optional.of(client));

        ResponseEntity<String> response = userController.submitReview(1, "http://review.com");

        assertEquals("Review submitted successfully", response.getBody());
        assertEquals(200, response.getStatusCodeValue());
        verify(clientRepo).save(client);
    }

    @Test
    void testSubmitReview_ClientNotFound() {
        when(clientRepo.findById(1)).thenReturn(Optional.empty());

        ResponseEntity<String> response = userController.submitReview(1, "http://review.com");

        assertEquals("Client not found", response.getBody());
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void testEditClient_Get_Success() {
        Client client = new Client();
        client.setId(1);
        client.setName("Test Client");
        client.setReviewLink("");
        when(clientRepo.findById(1)).thenReturn(Optional.of(client));

        String view = userController.editClient(1, model);

        assertEquals("user/edit", view);
        verify(model).addAttribute(eq("clientDao"), any(ClientDao.class));
        verify(model).addAttribute("clientId", 1);
    }

    @Test
    void testEditClient_Get_NotFound() {
        when(clientRepo.findById(1)).thenReturn(Optional.empty());

        String view = userController.editClient(1, model);

        assertEquals("redirect:/user?error=notfound", view);
    }

    @Test
    void testUpdateClient_Success() throws IOException {
        Client client = new Client();
        client.setId(1);
        client.setName("Old Name");
        ClientDao clientDao = new ClientDao();
        clientDao.setName("New Name");
        clientDao.setEmail("new@client.com");
        clientDao.setMobile("1234567890");
        clientDao.setReviewLink("");
        MockMultipartFile logo = new MockMultipartFile("logo", "logo.png", "image/png", "test".getBytes());
        clientDao.setLogo(logo);

        when(bindingResult.hasErrors()).thenReturn(false);
        when(clientRepo.findById(1)).thenReturn(Optional.of(client));
        when(clientRepo.findByName("New Name")).thenReturn(Collections.emptyList());
        when(clientRepo.findByEmail("new@client.com")).thenReturn(Optional.empty());
        when(clientRepo.findByMobile("1234567890")).thenReturn(Optional.empty());

        String view = userController.updateClient(1, clientDao, bindingResult, model);

        assertEquals("redirect:/user/home", view);
        verify(clientRepo).save(client);
    }

    @Test
    void testDeleteClient_Success() {
        String view = userController.deleteClient(1);

        assertEquals("redirect:/user/home", view);
        verify(clientRepo).deleteById(1);
    }

    @Test
    void testSearchClients_Success() {
        String query = "test";
        Pageable pageable = PageRequest.of(0, 10);
        Page<Client> clientPage = new PageImpl<>(Collections.emptyList());
        when(clientRepo.findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
                query, query, query, pageable)).thenReturn(clientPage);

        String view = userController.searchClients(query, 0, 10, model);

        assertEquals("user/home", view);
        verify(model).addAttribute("clients", clientPage);
        verify(model).addAttribute("currentPage", 0);
        verify(model).addAttribute("pageSize", 10);
        verify(model).addAttribute("searchQuery", query);
        verify(model).addAttribute("resourceURL", resourceAccessUrl);
    }
}