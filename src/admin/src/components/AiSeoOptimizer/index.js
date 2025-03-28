// admin/src/components/AiSeoOptimizer/index.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
  CircularProgress,
  Chip,
  Grid,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import {
  ExpandMore,
  Check,
  Error,
  Warning,
  Lightbulb,
  Search,
  TrendingUp,
  Star,
  StarBorder,
  ArrowUpward,
  KeyboardArrowRight,
} from "@material-ui/icons";
import styled from "styled-components";
import axios from "axios";

// Styled components
const OptimizationScoreCircle = styled(Box)`
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
`;

const ScoreValue = styled(Typography)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
`;

const KeywordTag = styled(Chip)`
  margin: 4px;
`;

const RecommendationCard = styled(Card)`
  margin-bottom: 16px;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

/**
 * AI SEO Optimizer Component for Strapi Admin
 */
const AiSeoOptimizer = ({
  contentType,
  contentId,
  contentData,
  seoData,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [keywords, setKeywords] = useState("");
  const [geographicFocus, setGeographicFocus] = useState("");
  const [optimizationLevel, setOptimizationLevel] = useState("standard");
  const [autoApply, setAutoApply] = useState(false);
  const [expandedSection, setExpandedSection] = useState("");

  // Load existing settings
  useEffect(() => {
    if (seoData?.aiOptimization) {
      setKeywords(seoData.aiOptimization.targetKeywords || "");
      setGeographicFocus(seoData.aiOptimization.geographicFocus || "");
      setOptimizationLevel(
        seoData.aiOptimization.optimizationLevel || "standard"
      );
      setAnalysisData(seoData.aiOptimization);
    }
  }, [seoData]);

  // Handle section expansion
  const handleSectionToggle = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : "");
  };

  // Run AI analysis
  const runAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare analysis parameters
      const analysisParams = {
        contentType,
        contentId,
        content: contentData,
        seo: seoData,
        aiSettings: {
          targetKeywords: keywords,
          geographicFocus,
          optimizationLevel,
          autoApply,
        },
      };

      // Call the API
      const response = await axios.post("/api/ai-seo/analyze", analysisParams);

      // Update state with results
      setAnalysisData(response.data);

      // If auto-apply is enabled, update SEO data
      if (autoApply && response.data) {
        const updatedSeoData = {
          ...seoData,
          metaTitle: response.data.metaTitle || seoData.metaTitle,
          metaDescription:
            response.data.metaDescription || seoData.metaDescription,
          focusKeyword: response.data.focusKeyword || seoData.focusKeyword,
          metaKeywords: response.data.metaKeywords || seoData.metaKeywords,
          structuredData:
            response.data.structuredData || seoData.structuredData,
          aiOptimization: {
            ...seoData.aiOptimization,
            ...response.data,
            lastOptimizationRun: new Date().toISOString(),
          },
        };

        // Call the parent component's onChange handler
        if (onChange) {
          onChange(updatedSeoData);
        }
      }
    } catch (err) {
      console.error("AI SEO analysis error:", err);
      setError(err.message || "Failed to run AI SEO analysis");
    } finally {
      setLoading(false);
    }
  };

  // Apply a specific recommendation
  const applyRecommendation = (field, value) => {
    // Update the SEO data
    const updatedSeoData = {
      ...seoData,
      [field]: value,
      aiOptimization: {
        ...seoData.aiOptimization,
        appliedSuggestions: {
          ...(seoData.aiOptimization?.appliedSuggestions || {}),
          [field]: {
            applied: true,
            appliedAt: new Date().toISOString(),
            originalValue: seoData[field],
            newValue: value,
          },
        },
      },
    };

    // Call the parent component's onChange handler
    if (onChange) {
      onChange(updatedSeoData);
    }
  };

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return "#4caf50"; // Green
    if (score >= 60) return "#ff9800"; // Orange
    return "#f44336"; // Red
  };

  return (
    <Box mt={3} mb={3}>
      <Box mb={3} pb={2} borderBottom={1} borderColor="divider">
        <Typography variant="h5" component="h2" gutterBottom>
          AI SEO Optimizer
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Let AI analyze and optimize your content for better search engine
          rankings
        </Typography>
      </Box>

      {/* Analysis Configuration */}
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Target Keywords"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter target keywords (one per line, most important first)"
              helperText="These are the keywords you want to rank for"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Geographic Focus"
              fullWidth
              variant="outlined"
              value={geographicFocus}
              onChange={(e) => setGeographicFocus(e.target.value)}
              placeholder="e.g., Miami, Florida"
              helperText="Target location for local SEO"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Optimization Level"
              fullWidth
              variant="outlined"
              value={optimizationLevel}
              onChange={(e) => setOptimizationLevel(e.target.value)}
              SelectProps={{
                native: true,
              }}
              helperText="How aggressively should AI optimize your content"
            >
              <option value="basic">Basic - Subtle improvements</option>
              <option value="standard">Standard - Balanced optimization</option>
              <option value="aggressive">
                Aggressive - Prioritize SEO over style
              </option>
              <option value="maximum">Maximum - Optimize everything</option>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6} container alignItems="center">
            <Box display="flex" justifyContent="flex-end" width="100%">
              <Button
                variant="contained"
                color="primary"
                onClick={runAnalysis}
                disabled={loading || !keywords.trim()}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Search />
                  )
                }
              >
                {loading ? "Analyzing..." : "Run AI Analysis"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <>
          {/* Optimization Score */}
          <Box mb={4} textAlign="center">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <OptimizationScoreCircle>
                  <CircularProgress
                    variant="determinate"
                    value={analysisData.optimizationScore || 0}
                    size={100}
                    thickness={5}
                    style={{
                      color: getScoreColor(analysisData.optimizationScore || 0),
                    }}
                  />
                  <ScoreValue>{analysisData.optimizationScore || 0}</ScoreValue>
                </OptimizationScoreCircle>
                <Typography variant="subtitle1" align="center" gutterBottom>
                  SEO Score
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                >
                  Last updated:{" "}
                  {new Date(analysisData.lastOptimizationRun).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Typography variant="subtitle1" gutterBottom>
                    Focus Keywords
                  </Typography>
                  <Box display="flex" flexWrap="wrap">
                    {analysisData.focusKeyword && (
                      <KeywordTag
                        label={analysisData.focusKeyword}
                        color="primary"
                        icon={<Star />}
                      />
                    )}
                    {analysisData.metaKeywords &&
                      analysisData.metaKeywords
                        .split(",")
                        .map((keyword, index) => (
                          <KeywordTag
                            key={index}
                            label={keyword.trim()}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Recommendations Accordions */}
          <Box mb={4}>
            {/* Title & Meta Description */}
            <Accordion
              expanded={expandedSection === "metadata"}
              onChange={handleSectionToggle("metadata")}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Title & Meta Description
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <RecommendationCard>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Recommended Title
                        </Typography>
                        <Box
                          p={2}
                          bgcolor="rgba(0, 0, 0, 0.03)"
                          borderRadius={1}
                          mb={2}
                        >
                          <Typography>{analysisData.metaTitle}</Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          {analysisData.titleTagImprovements}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() =>
                            applyRecommendation(
                              "metaTitle",
                              analysisData.metaTitle
                            )
                          }
                          startIcon={<Check />}
                          style={{ marginTop: 8 }}
                        >
                          Apply This Title
                        </Button>
                      </CardContent>
                    </RecommendationCard>
                  </Grid>

                  <Grid item xs={12}>
                    <RecommendationCard>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Recommended Meta Description
                        </Typography>
                        <Box
                          p={2}
                          bgcolor="rgba(0, 0, 0, 0.03)"
                          borderRadius={1}
                          mb={2}
                        >
                          <Typography>
                            {analysisData.metaDescription}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          {analysisData.metaDescriptionImprovements}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() =>
                            applyRecommendation(
                              "metaDescription",
                              analysisData.metaDescription
                            )
                          }
                          startIcon={<Check />}
                          style={{ marginTop: 8 }}
                        >
                          Apply This Description
                        </Button>
                      </CardContent>
                    </RecommendationCard>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Content Suggestions */}
            <Accordion
              expanded={expandedSection === "content"}
              onChange={handleSectionToggle("content")}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Content Optimization Suggestions
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Suggested Headings
                    </Typography>
                    <List>
                      {analysisData.suggestedHeadings &&
                        analysisData.suggestedHeadings.map((heading, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <KeyboardArrowRight />
                            </ListItemIcon>
                            <ListItemText primary={heading} />
                          </ListItem>
                        ))}
                    </List>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Content Improvement Ideas
                    </Typography>
                    <List>
                      {analysisData.contentSuggestions &&
                        analysisData.contentSuggestions.map(
                          (suggestion, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Lightbulb />
                              </ListItemIcon>
                              <ListItemText primary={suggestion} />
                            </ListItem>
                          )
                        )}
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Structured Data */}
            <Accordion
              expanded={expandedSection === "schema"}
              onChange={handleSectionToggle("schema")}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Structured Data (Schema Markup)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box mb={2}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Structured data helps search engines understand your
                        content and can enable rich results in search.
                      </Typography>

                      {analysisData.structuredData ? (
                        <>
                          <Box
                            p={2}
                            bgcolor="rgba(0, 0, 0, 0.03)"
                            borderRadius={1}
                            mb={2}
                            maxHeight="300px"
                            overflow="auto"
                          >
                            <pre style={{ margin: 0 }}>
                              {JSON.stringify(
                                analysisData.structuredData,
                                null,
                                2
                              )}
                            </pre>
                          </Box>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() =>
                              applyRecommendation(
                                "structuredData",
                                analysisData.structuredData
                              )
                            }
                            startIcon={<Check />}
                          >
                            Apply This Schema
                          </Button>
                        </>
                      ) : (
                        <Alert severity="info">
                          No structured data recommendations available.
                        </Alert>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Local SEO */}
            <Accordion
              expanded={expandedSection === "localSeo"}
              onChange={handleSectionToggle("localSeo")}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Local SEO Recommendations
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {analysisData.localSeoRecommendations &&
                    analysisData.localSeoRecommendations.length > 0 ? (
                      <List>
                        {analysisData.localSeoRecommendations.map(
                          (recommendation, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <MapMarkerIcon />
                              </ListItemIcon>
                              <ListItemText primary={recommendation} />
                            </ListItem>
                          )
                        )}
                      </List>
                    ) : (
                      <Alert severity="info">
                        No local SEO recommendations available.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Social Media Optimization */}
            <Accordion
              expanded={expandedSection === "social"}
              onChange={handleSectionToggle("social")}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  Social Media Optimization
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <RecommendationCard>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Open Graph Title
                        </Typography>
                        <Box
                          p={2}
                          bgcolor="rgba(0, 0, 0, 0.03)"
                          borderRadius={1}
                          mb={2}
                        >
                          <Typography>{analysisData.ogTitle}</Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() =>
                            applyRecommendation("ogTitle", analysisData.ogTitle)
                          }
                          startIcon={<Check />}
                        >
                          Apply
                        </Button>
                      </CardContent>
                    </RecommendationCard>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RecommendationCard>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Open Graph Description
                        </Typography>
                        <Box
                          p={2}
                          bgcolor="rgba(0, 0, 0, 0.03)"
                          borderRadius={1}
                          mb={2}
                        >
                          <Typography>{analysisData.ogDescription}</Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() =>
                            applyRecommendation(
                              "ogDescription",
                              analysisData.ogDescription
                            )
                          }
                          startIcon={<Check />}
                        >
                          Apply
                        </Button>
                      </CardContent>
                    </RecommendationCard>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                // Reset analysis data
                setAnalysisData(null);
              }}
            >
              Reset Analysis
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                // Apply all recommendations
                if (analysisData) {
                  const fieldsToUpdate = [
                    "metaTitle",
                    "metaDescription",
                    "focusKeyword",
                    "metaKeywords",
                    "structuredData",
                    "ogTitle",
                    "ogDescription",
                  ];

                  const updatedSeoData = { ...seoData };
                  const appliedSuggestions = {
                    ...(seoData.aiOptimization?.appliedSuggestions || {}),
                  };

                  // Update each field if it exists in the analysis data
                  fieldsToUpdate.forEach((field) => {
                    if (analysisData[field]) {
                      updatedSeoData[field] = analysisData[field];
                      appliedSuggestions[field] = {
                        applied: true,
                        appliedAt: new Date().toISOString(),
                        originalValue: seoData[field],
                        newValue: analysisData[field],
                      };
                    }
                  });

                  // Update AI optimization data
                  updatedSeoData.aiOptimization = {
                    ...seoData.aiOptimization,
                    ...analysisData,
                    appliedSuggestions,
                  };

                  // Call the parent component's onChange handler
                  if (onChange) {
                    onChange(updatedSeoData);
                  }
                }
              }}
            >
              Apply All Recommendations
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

const MapMarkerIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
      fill="currentColor"
    />
  </svg>
);

export default AiSeoOptimizer;
