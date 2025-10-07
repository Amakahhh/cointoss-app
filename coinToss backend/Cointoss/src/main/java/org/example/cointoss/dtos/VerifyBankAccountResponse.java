package org.example.cointoss.dtos;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyBankAccountResponse {
    private boolean status;
    private String message;
    private DataObj data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataObj {

        @SerializedName("bank_name")
        private String bankName;

        @SerializedName("bank_code")
        private String bankCode;

        @SerializedName("account_number")
        private String accountNumber;

        @SerializedName("account_name")
        private String accountName;
    }
}
