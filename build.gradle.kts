import org.gradle.api.publish.tasks.GenerateModuleMetadata

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

tasks.withType<GenerateModuleMetadata>().configureEach {
  // The consumer's BOM resolves the versionless dependencies in the Maven POM.
  enabled = false
}

sourceSets {
  main {
    java.srcDir("generated/java/src/main/java")
  }
}

val apiDependencies =
    listOf(
        "org.springframework:spring-context",
        "org.springframework:spring-core",
        "org.springframework:spring-web",
        "jakarta.annotation:jakarta.annotation-api",
        "jakarta.servlet:jakarta.servlet-api",
        "jakarta.validation:jakarta.validation-api",
        "org.jspecify:jspecify",
        "com.fasterxml.jackson.core:jackson-annotations",
    )

dependencies {
  compileOnly(platform("org.springframework.boot:spring-boot-dependencies:4.1.3"))
  apiDependencies.forEach { compileOnly(it) }
}

publishing {
  publications {
    create<MavenPublication>("mavenJava") {
      from(components["java"])

      pom {
        name.set("budget-buddy-contracts")
        description.set("Generated Spring API contracts for Budget Buddy")
        url.set("https://github.com/budget-buddy-org/budget-buddy-contracts")

        withXml {
          val dependenciesNode = asNode().appendNode("dependencies")
          apiDependencies.forEach { coordinate ->
            val (dependencyGroup, dependencyArtifact) = coordinate.split(":")
            val dependency = dependenciesNode.appendNode("dependency")
            dependency.appendNode("groupId", dependencyGroup)
            dependency.appendNode("artifactId", dependencyArtifact)
          }
        }
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
