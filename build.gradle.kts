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

sourceSets {
  main {
    java.srcDir("generated/java/src/main/java")
  }
}

dependencies {
  val springVersion = "7.0.11"
  api("org.springframework:spring-context:$springVersion")
  api("org.springframework:spring-core:$springVersion")
  api("org.springframework:spring-web:$springVersion")
  api("jakarta.validation:jakarta.validation-api:3.1.1")
  api("org.jspecify:jspecify:1.0.1")
  api("com.fasterxml.jackson.core:jackson-annotations:2.21")

  compileOnly("jakarta.annotation:jakarta.annotation-api:3.0.0")
  compileOnly("jakarta.servlet:jakarta.servlet-api:6.1.0")
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
