plugins {
  `java-library`
  `maven-publish`
}

group = "com.budgetbuddy"
version = providers.gradleProperty("artifactVersion").getOrElse("0.0.0-SNAPSHOT")

repositories {
  mavenCentral()
}

dependencyLocking {
  lockAllConfigurations()
}

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(25)
  }
  withSourcesJar()
}

val generateJavaContracts = tasks.register<Exec>("generateJavaContracts") {
  inputs.dir("specs")
  inputs.files("config/spring-server.yaml", "openapitools.json", "package.json", "pnpm-lock.yaml")
  outputs.dir("generated/java/src/main/java")
  commandLine("env", "pnpm", "run", "generate:java")
}

sourceSets {
  main {
    java.srcDir(generateJavaContracts)
  }
}

dependencies {
  api(libs.spring.context)
  api(libs.spring.core)
  api(libs.spring.web)
  api(libs.jakarta.validation)
  api(libs.jspecify)
  api(libs.jackson.annotations)

  compileOnly(libs.jakarta.annotation)
  compileOnly(libs.jakarta.servlet)
}

publishing {
  publications {
    create<MavenPublication>("mavenJava") {
      from(components["java"])

      pom {
        name.set("budget-buddy-contracts")
        description.set("Generated Spring API contracts for Budget Buddy")
        url.set("https://github.com/budget-buddy-org/budget-buddy-contracts")
      }
    }
  }

  repositories {
    maven {
      name = "GitHubPackages"
      url = uri("https://maven.pkg.github.com/budget-buddy-org/budget-buddy-contracts")
      credentials {
        username = providers.environmentVariable("GITHUB_ACTOR").orNull ?: ""
        password = providers.environmentVariable("GITHUB_TOKEN").orNull ?: ""
      }
    }
  }
}
