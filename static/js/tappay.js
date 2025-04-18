export function tappay() {
  TPDirect.setupSDK(
    159760,
    "app_FCry3aTTBYIymRBKaIpKSo2AI1RE6zfJ7RMHHQlp7nnG75PHml60IBJ7xDi8",
    "sandbox"
  );
  TPDirect.card.setup({
    fields: {
      number: {
        element: "#card-number",
        placeholder: "**** **** **** ****",
      },
      expirationDate: {
        element: document.getElementById("card-expiration-date"),
        placeholder: "MM / YY",
      },
      ccv: {
        element: "#card-ccv",
        placeholder: "CCV",
      },
    },
    styles: {
      input: {
        width: "200px",
        height: "38px",
        "border-radius": "5px",
        border: "1px solid #e8e8e8",
        "font-size": "16px",
        "font-weight": "500",
        "margin-bottom": "15px",
        "padding-left": "10px",
      },
    },
  });
}
