# Acesse https://aka.ms/customizecontainer para saber como personalizar seu contêiner de depuração e como o Visual Studio usa este Dockerfile para criar suas imagens para uma depuração mais rápida.

# Esta fase é usada durante a execução no VS no modo rápido (Padrão para a configuração de Depuração)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 3001


# Esta fase é usada para compilar o projeto de serviço
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Hiraishin.API/Hiraishin.API.csproj", "Hiraishin.API/"]
COPY ["Hiraishin.Data.Context/Hiraishin.Data.Context.csproj", "Hiraishin.Data.Context/"]
COPY ["Hiraishin.Domain.Entities/Hiraishin.Domain.Entities.csproj", "Hiraishin.Domain.Entities/"]
COPY ["Hiraishin.Services/Hiraishin.Services.csproj", "Hiraishin.Services/"]
COPY ["Hiraishin.Domain.Dto/Hiraishin.Domain.Dto.csproj", "Hiraishin.Domain.Dto/"]
COPY ["Hiraishin.Domain.Interface.Services/Hiraishin.Domain.Interface.Services.csproj", "Hiraishin.Domain.Interface.Services/"]
COPY ["Hiraishin.Domain.Utility/Hiraishin.Domain.Utility.csproj", "Hiraishin.Domain.Utility/"]
COPY ["Hiraishin.Jobs/Hiraishin.Jobs.csproj", "Hiraishin.Jobs/"]
RUN dotnet restore "./Hiraishin.API/Hiraishin.API.csproj"
COPY . .
WORKDIR "/src/Hiraishin.API"
RUN dotnet build "./Hiraishin.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Esta fase é usada para publicar o projeto de serviço a ser copiado para a fase final
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Hiraishin.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Esta fase é usada na produção ou quando executada no VS no modo normal (padrão quando não está usando a configuração de Depuração)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Hiraishin.API.dll"]