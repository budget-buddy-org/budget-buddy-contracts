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
  implementation("com.budgetbuddy:budget-buddy-contracts:0.0.0-SNAPSHOT")
}
