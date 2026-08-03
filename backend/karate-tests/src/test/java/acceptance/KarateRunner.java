package acceptance;

import com.intuit.karate.junit5.Karate;

class KarateRunner {

  @Karate.Test
  Karate acceptance() {
    return Karate.run("classpath:features");
  }
}
