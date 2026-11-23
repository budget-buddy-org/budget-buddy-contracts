plugins {
  java
}

java {
  toolchain.languageVersion = JavaLanguageVersion.of(25)
}

repositories {
  exclusiveContent {
    forRepository {
      mavenLocal {
        metadataSources {
          mavenPom()
          ignoreGradleMetadataRedirection()
        }
      }
    }
    filter { includeGroup("com.budgetbuddy") }
  }
  mavenCentral()
}

dependencies {
  val artifactVersion = providers.gradleProperty("artifactVersion").get()
  implementation("com.budgetbuddy:budget-buddy-contracts:$artifactVersion")
}
