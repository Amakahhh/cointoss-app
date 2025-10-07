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
public class VerifyBankAccountRequest {
    @SerializedName("bank")
    private String bank;

    @SerializedName("account")
    private String account;

    @SerializedName("currency")
    @Builder.Default
    private String currency = "NGN";
}
