import com.budget.buddy.budget_buddy_contracts.generated.api.UsersApi;
import org.springframework.http.ResponseEntity;

final class ContractsConsumer implements UsersApi {
  ResponseEntity<Void> clearData() {
    return clearCurrentUserData();
  }
}
