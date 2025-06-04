package com.yrhp.crud.Controller;

import com.yrhp.crud.controller.HomeController;
import com.yrhp.crud.model.UserDtls;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.validation.BindingResult;
import com.yrhp.crud.service.UserService;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(HomeController.class)
@ContextConfiguration(classes = {HomeController.class})
@AutoConfigureMockMvc(addFilters = false)
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void testLoginPage() throws Exception {
        mockMvc.perform(get("/signin"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));
    }

    @Test
    void testRootRedirect() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/signin"));
    }

    @Test
    void testRegisterPage() throws Exception {
        mockMvc.perform(get("/register"))
                .andExpect(status().isOk())
                .andExpect(view().name("register"))
                .andExpect(model().attributeExists("user"))
                .andExpect(model().attribute("user", instanceOf(UserDtls.class)));
    }

    @Test
    void testRegisterPageWithSessionMessage() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("msg", "Test message");

        mockMvc.perform(get("/register").session(session))
                .andExpect(status().isOk())
                .andExpect(model().attributeExists("msg"))
                .andExpect(model().attribute("msg", "Test message"))
                .andExpect(request().sessionAttributeDoesNotExist("msg"));
    }

//    @Test
//    void testCreateUser_ValidData() throws Exception {
//        mockMvc.perform(post("/createUser")
//                        .param("username", "validUser")
//                        .param("password", "ValidPass123!")
//                        .param("email", "test@example.com")
//                        .param("mobile", "+1234567890")
//                        .param("role", "USER"))
//                .andExpect(status().is3xxRedirection())
//                .andExpect(redirectedUrl("/signin"))
//                .andExpect(flash().attributeExists("msg"));
//    }

    @Test
    void testCreateUser_InvalidData() throws Exception {
        MvcResult result = mockMvc.perform(post("/createUser")
                        .param("username", "a")
                        .param("password", "short")
                        .param("email", "invalid-email")
                        .param("mobile", "123")
                        .param("role", "USER"))
                .andExpect(status().isOk())
                .andExpect(view().name("register"))
                .andReturn();

        BindingResult bindingResult = (BindingResult) result.getModelAndView()
                .getModel()
                .get(BindingResult.MODEL_KEY_PREFIX + "user");

        assertTrue(bindingResult.hasFieldErrors("username"));
        assertTrue(bindingResult.hasFieldErrors("password"));
        assertTrue(bindingResult.hasFieldErrors("email"));
        assertTrue(bindingResult.hasFieldErrors("mobile"));
    }
}