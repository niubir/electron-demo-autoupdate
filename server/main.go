package main

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	"gopkg.in/yaml.v3"
)

const (
	win32_latest_json_path  = "./static/win32/latest.yml"
	darwin_latest_json_path = "./static/darwin/latest.yml"
)

var (
	// latests = map[string]map[string]Latest{}
	latests = map[string]Latest{}
)

type (
	Latest struct {
		Version     string       `yaml:"version" json:"version"`
		Path        string       `yaml:"path" json:"path"`
		Sha512      string       `yaml:"sha512" json:"sha512"`
		ReleaseDate string       `yaml:"releaseDate" json:"releaseDate"`
		Files       []LatestFile `yaml:"files" json:"files"`
	}
	LatestFile struct {
		URL    string `yaml:"url" json:"url"`
		Sha512 string `yaml:"sha512" json:"sha512"`
		Size   int64  `yaml:"size" json:"size"`
	}
)

func init() {
	win32Latest, err := loadLatestFile(win32_latest_json_path)
	if err != nil {
		panic(err)
	}
	latests["win32"] = *win32Latest

	// darwinLatest, err := loadLatestFile(darwin_latest_json_path)
	// if err != nil {
	// 	panic(err)
	// }
	// latests["darwin"] = *darwinLatest
}

func main() {
	gin.SetMode("release")
	engine := gin.Default()
	api := engine.Group("/update")

	// api.Any("/:platform/:arch/latest.yml", latest)
	api.Any("/:platform/latest.yml", latest)

	if err := engine.Run(":20001"); err != nil {
		panic(err)
	}
}

func latest(c *gin.Context) {
	var req struct {
		Platform string `uri:"platform" binding:"required"`
		// Arch     string `uri:"arch" binding:"required"`
	}

	if err := c.ShouldBindUri(&req); err != nil {
		c.YAML(http.StatusBadRequest, gin.H{"error": "Parse uri failed"})
		return
	}

	// latest, ok := latests[req.Platform][req.Arch]
	latest, ok := latests[req.Platform]
	if !ok {
		// c.YAML(http.StatusBadRequest, gin.H{"error": fmt.Sprintf(
		// 	"platform: [%s], arch: [%s] not support",
		// 	req.Platform, req.Arch,
		// )})
		c.YAML(http.StatusBadRequest, gin.H{"error": fmt.Sprintf(
			"platform: [%s] not support",
			req.Platform,
		)})
		return
	}
	c.YAML(http.StatusOK, latest)
}

func loadLatestFile(path string) (*Latest, error) {
	body, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var latest Latest
	if err := yaml.Unmarshal(body, &latest); err != nil {
		return nil, err
	}
	return &latest, nil
}
