package vn.agent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.agent.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String userName);
}
