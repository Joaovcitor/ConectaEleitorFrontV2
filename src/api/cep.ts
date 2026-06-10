export type CepAddress = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const cepService = {
  lookup: async (zipCode: string): Promise<CepAddress> => {
    const cep = onlyDigits(zipCode);
    if (cep.length !== 8) throw new Error("Informe um CEP com 8 dígitos.");

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error("Não foi possível consultar o CEP.");

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) throw new Error("CEP não encontrado.");

    return {
      cep: data.cep ?? zipCode,
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
      complement: data.complemento ?? "",
    };
  },
};
