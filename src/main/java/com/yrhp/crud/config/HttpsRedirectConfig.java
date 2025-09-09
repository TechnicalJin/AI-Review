package com.yrhp.crud.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.apache.catalina.valves.RemoteIpValve;

@Configuration
@Profile("prod")
public class HttpsRedirectConfig {

    private static final Logger logger = LoggerFactory.getLogger(HttpsRedirectConfig.class);

    @Bean
    public ServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        
        // Add RemoteIpValve to handle X-Forwarded-* headers properly
        RemoteIpValve remoteIpValve = new RemoteIpValve();
        remoteIpValve.setRemoteIpHeader("X-Forwarded-For");
        remoteIpValve.setProxiesHeader("X-Forwarded-By");
        remoteIpValve.setProtocolHeader("X-Forwarded-Proto");
        remoteIpValve.setProtocolHeaderHttpsValue("https");
        remoteIpValve.setHttpsServerPort(443);
        remoteIpValve.setHttpServerPort(80);
        
        tomcat.addEngineValves(remoteIpValve);
        
        logger.info("Configured Tomcat with RemoteIpValve for HTTPS proxy handling");
        return tomcat;
    }
}
