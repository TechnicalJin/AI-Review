//package com.yrhp.crud.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.ComponentScan;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.format.FormatterRegistry;
//import org.springframework.http.converter.HttpMessageConverter;
//import org.springframework.validation.MessageCodesResolver;
//import org.springframework.validation.Validator;
//import org.springframework.web.method.support.HandlerMethodArgumentResolver;
//import org.springframework.web.method.support.HandlerMethodReturnValueHandler;
//import org.springframework.web.servlet.HandlerExceptionResolver;
//import org.springframework.web.servlet.ViewResolver;
//import org.springframework.web.servlet.config.annotation.*;
//import org.springframework.web.servlet.view.InternalResourceViewResolver;
//import org.springframework.web.servlet.view.JstlView;
//
//import java.util.List;
//
//@EnableWebMvc
//@Configuration
//@ComponentScan("com.yrhp")
//public class WebConfig implements WebMvcConfigurer {
//@Bean
//    public ViewResolver internalResourceViewResolver() {
//        InternalResourceViewResolver bean = new InternalResourceViewResolver();
//        bean.setViewClass(JstlView.class);
//        bean.setPrefix("/templates/");
//        bean.setSuffix(".html");
//        return bean;
//    }
//
//
//    @Override
//    public void addFormatters(FormatterRegistry formatterRegistry) {
//
//    }
//
//    @Override
//    public void configureMessageConverters(List<HttpMessageConverter<?>> list) {
//
//    }
//
//    @Override
//    public void extendMessageConverters(List<HttpMessageConverter<?>> list) {
//
//    }
//
//    @Override
//    public Validator getValidator() {
//        return null;
//    }
//
//    @Override
//    public void configureContentNegotiation(ContentNegotiationConfigurer contentNegotiationConfigurer) {
//
//    }
//
//    @Override
//    public void configureAsyncSupport(AsyncSupportConfigurer asyncSupportConfigurer) {
//
//    }
//
//    @Override
//    public void configurePathMatch(PathMatchConfigurer pathMatchConfigurer) {
//
//    }
//
//    @Override
//    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> list) {
//
//    }
//
//    @Override
//    public void addReturnValueHandlers(List<HandlerMethodReturnValueHandler> list) {
//
//    }
//
//    @Override
//    public void configureHandlerExceptionResolvers(List<HandlerExceptionResolver> list) {
//
//    }
//
//    @Override
//    public void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> list) {
//
//    }
//
//    @Override
//    public void addInterceptors(InterceptorRegistry interceptorRegistry) {
//
//    }
//
//    @Override
//    public MessageCodesResolver getMessageCodesResolver() {
//        return null;
//    }
//
//    @Override
//    public void addViewControllers(ViewControllerRegistry viewControllerRegistry) {
//
//    }
//
//    @Override
//    public void configureViewResolvers(ViewResolverRegistry viewResolverRegistry) {
//        viewResolverRegistry.jsp("/WEB-INF/jsp/", ".jsp");
//    }
//
//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        registry.addResourceHandler("/static/**").addResourceLocations("classpath:/static/");
//        registry.addResourceHandler("/uploads/**").addResourceLocations("file:///C:/uploads/");
//    }
//
//
//    @Override
//    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
//        configurer.enable();
//    }
//
//
//    @Override
//    public void addCorsMappings(CorsRegistry corsRegistry) {
//
//    }
//}
