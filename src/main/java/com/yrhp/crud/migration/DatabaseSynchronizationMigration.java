//package com.yrhp.crud.migration;
//
//import jakarta.annotation.PostConstruct;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.stereotype.Component;
//
//@Component
//public class DatabaseSynchronizationMigration {
//
//    private final JdbcTemplate jdbcTemplate;
//
//    public DatabaseSynchronizationMigration(JdbcTemplate jdbcTemplate) {
//        this.jdbcTemplate = jdbcTemplate;
//    }
//
//    @PostConstruct
//    public void initializeDatabaseSynchronization() {
//        try {
//            // Initial data migration (copy existing clients to user_details)
//            migrateExistingClients();
//
//            // Create triggers
//            createInsertTrigger();
//            createDeleteTrigger();
//            createUpdateTrigger();
//
//            System.out.println("Database synchronization triggers created successfully");
//        } catch (Exception e) {
//            System.err.println("Error creating database synchronization triggers: " + e.getMessage());
//        }
//    }
//
//    private void migrateExistingClients() {
//        jdbcTemplate.execute(
//            "INSERT INTO user_details (email, mobile, password, role, username) " +
//            "SELECT c.email, c.mobile, c.password, c.role, c.name " +
//            "FROM clients c " +
//            "WHERE NOT EXISTS ( " +
//            "   SELECT 1 FROM user_details u WHERE u.email = c.email " +
//            ")"
//        );
//    }
//
//    private void createInsertTrigger() {
//        jdbcTemplate.execute(
//            "CREATE TRIGGER after_client_insert AFTER INSERT ON clients FOR EACH ROW " +
//            "BEGIN " +
//            "   INSERT INTO user_details (email, mobile, password, role, username) " +
//            "   VALUES (NEW.email, NEW.mobile, NEW.password, NEW.role, NEW.name); " +
//            "END;"
//        );
//    }
//
//    private void createDeleteTrigger() {
//        jdbcTemplate.execute(
//            "CREATE TRIGGER after_client_delete AFTER DELETE ON clients FOR EACH ROW " +
//            "BEGIN " +
//            "   DELETE FROM user_details WHERE email = OLD.email; " +
//            "END;"
//        );
//    }
//
//    private void createUpdateTrigger() {
//        jdbcTemplate.execute(
//            "CREATE TRIGGER after_client_update AFTER UPDATE ON clients FOR EACH ROW " +
//            "BEGIN " +
//            "   UPDATE user_details SET " +
//            "       email = NEW.email, " +
//            "       mobile = NEW.mobile, " +
//            "       password = NEW.password, " +
//            "       role = NEW.role, " +
//            "       username = NEW.name " +
//            "   WHERE email = OLD.email; " +
//            "END;"
//        );
//    }
//}