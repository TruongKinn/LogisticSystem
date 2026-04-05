package vn.agent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.agent.model.UserHasRole;

public interface UserHasRoleRepository extends JpaRepository<UserHasRole, Long> {
}
