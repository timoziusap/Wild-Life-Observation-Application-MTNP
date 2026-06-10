package hs.aalen.location;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// Beobachtungsort
@Entity
public class Location {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long lNr;

	private String shorttitle;
	private String description;
	private String latitude;
	private String longitude;

	public Location() {
		super();
	}

	public Location(String shorttitle, String description, String latitude, String longitude) {
		super();
		this.shorttitle = shorttitle;
		this.description = description;
		this.latitude = latitude;
		this.longitude = longitude;
	}

	// JsonProperty noetig, weil Jackson getlNr sonst nicht als Getter erkennt
	@JsonProperty("lNr")
	public Long getlNr() {
		return lNr;
	}
	public void setlNr(Long lNr) {
		this.lNr = lNr;
	}
	public String getShorttitle() {
		return shorttitle;
	}
	public void setShorttitle(String shorttitle) {
		this.shorttitle = shorttitle;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String getLatitude() {
		return latitude;
	}
	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}
	public String getLongitude() {
		return longitude;
	}
	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

}
