
package com.yrhp.crud.service;

import com.yrhp.crud.dao.ClientDao;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public abstract class ClientService {

    @Autowired
    private ClientRepository clientRepo;

    public Client saveClient(ClientDao clientDao) {
        Client client = new Client();
        client.setName(clientDao.getName());
        client.setEmail(clientDao.getEmail());
        client.setMobile(clientDao.getMobile());
        client.setReviewLink(clientDao.getReviewLink());
        /*client.setReviewCharLimit(clientDao.getReviewCharLimit());*/
        client.setChatText(clientDao.getChatText());
        client.setGenerateLink("/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase());

        return clientRepo.save(client);
    }
}