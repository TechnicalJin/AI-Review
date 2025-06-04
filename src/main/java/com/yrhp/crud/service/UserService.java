package com.yrhp.crud.service;

import com.yrhp.crud.model.UserDtls;

public interface UserService {

    UserDtls createUser(UserDtls user);

    boolean checkEmail(String email);
}
