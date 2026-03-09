package com.opale.micro_planning;

import com.google.ortools.Loader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MicroPlanningApplication {

	static {
		Loader.loadNativeLibraries();
	}
	public static void main(String[] args) {
		SpringApplication.run(MicroPlanningApplication.class, args);
	}

}
