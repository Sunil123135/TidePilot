/**
 * Agent Registry - Maps agent names and contract types to handlers.
 * All AI calls should be routed through the Orchestrator, which uses this registry.
 */
import * as handlers from './handlers';
import type { z } from 'zod';
import {
  StrategicPositioningSchema,
  AuthorityRoadmapSchema,
  ContentGapSchema,
} from '../contracts/agent-strategy';
import {
  EngagementVelocitySchema,
  EarlySuccessPredictSchema,
  PatternAnomalySchema,
} from '../contracts/agent-performance';
import {
  HookClassifySchema,
  HookScoreSchema,
  HookImproveSchema,
} from '../contracts/agent-hook';
import {
  RelationshipDepthSchema,
  ReengagementSuggestionSchema,
  CollabOpportunitySchema,
} from '../contracts/agent-relationship';
import {
  ReputationRiskSchema,
  ClaimValiditySchema,
  ToneEscalationSchema,
} from '../contracts/agent-reputation';
import {
  GrowthSimulateSchema,
  AuthorityProjectionSchema,
  PostFrequencyOptimizerSchema,
} from '../contracts/agent-growth';
import {
  ExperimentPlanSchema,
  VariantCompareSchema,
  StatisticalSignalSchema,
} from '../contracts/agent-experiment';
import {
  KnowledgeGraphSchema,
  IntellectualTerritorySchema,
  TopicExpansionSchema,
} from '../contracts/agent-knowledge';
import {
  AudienceRewriteSchema,
  SegmentAlignmentSchema,
} from '../contracts/agent-persona';
import {
  MonetizationOpportunitySchema,
  LeadMagnetSchema,
  ServicePositioningSchema,
} from '../contracts/agent-monetization';

export type ContractType =
  | 'STRATEGIC_POSITIONING_ANALYSIS'
  | 'AUTHORITY_ROADMAP_GENERATE'
  | 'CONTENT_GAP_DETECTION'
  | 'ENGAGEMENT_VELOCITY_ANALYSIS'
  | 'EARLY_SUCCESS_PREDICT'
  | 'PATTERN_ANOMALY_DETECT'
  | 'HOOK_CLASSIFY'
  | 'HOOK_SCORE'
  | 'HOOK_IMPROVE'
  | 'RELATIONSHIP_DEPTH_SCORE'
  | 'REENGAGEMENT_SUGGESTION'
  | 'COLLAB_OPPORTUNITY_DETECT'
  | 'REPUTATION_RISK_SCORE'
  | 'CLAIM_VALIDITY_CHECK'
  | 'TONE_ESCALATION_DETECT'
  | 'GROWTH_SIMULATE'
  | 'AUTHORITY_PROJECTION'
  | 'POST_FREQUENCY_OPTIMIZER'
  | 'EXPERIMENT_PLAN_GENERATE'
  | 'VARIANT_COMPARE'
  | 'STATISTICAL_SIGNAL_CHECK'
  | 'KNOWLEDGE_GRAPH_BUILD'
  | 'INTELLECTUAL_TERRITORY_MAP'
  | 'TOPIC_EXPANSION_SUGGEST'
  | 'AUDIENCE_REWRITE'
  | 'SEGMENT_ALIGNMENT_SCORE'
  | 'MONETIZATION_OPPORTUNITY_DETECT'
  | 'LEAD_MAGNET_SUGGEST'
  | 'SERVICE_POSITIONING_ANALYZE';

const CONTRACT_SCHEMAS: Record<ContractType, z.ZodSchema> = {
  STRATEGIC_POSITIONING_ANALYSIS: StrategicPositioningSchema,
  AUTHORITY_ROADMAP_GENERATE: AuthorityRoadmapSchema,
  CONTENT_GAP_DETECTION: ContentGapSchema,
  ENGAGEMENT_VELOCITY_ANALYSIS: EngagementVelocitySchema,
  EARLY_SUCCESS_PREDICT: EarlySuccessPredictSchema,
  PATTERN_ANOMALY_DETECT: PatternAnomalySchema,
  HOOK_CLASSIFY: HookClassifySchema,
  HOOK_SCORE: HookScoreSchema,
  HOOK_IMPROVE: HookImproveSchema,
  RELATIONSHIP_DEPTH_SCORE: RelationshipDepthSchema,
  REENGAGEMENT_SUGGESTION: ReengagementSuggestionSchema,
  COLLAB_OPPORTUNITY_DETECT: CollabOpportunitySchema,
  REPUTATION_RISK_SCORE: ReputationRiskSchema,
  CLAIM_VALIDITY_CHECK: ClaimValiditySchema,
  TONE_ESCALATION_DETECT: ToneEscalationSchema,
  GROWTH_SIMULATE: GrowthSimulateSchema,
  AUTHORITY_PROJECTION: AuthorityProjectionSchema,
  POST_FREQUENCY_OPTIMIZER: PostFrequencyOptimizerSchema,
  EXPERIMENT_PLAN_GENERATE: ExperimentPlanSchema,
  VARIANT_COMPARE: VariantCompareSchema,
  STATISTICAL_SIGNAL_CHECK: StatisticalSignalSchema,
  KNOWLEDGE_GRAPH_BUILD: KnowledgeGraphSchema,
  INTELLECTUAL_TERRITORY_MAP: IntellectualTerritorySchema,
  TOPIC_EXPANSION_SUGGEST: TopicExpansionSchema,
  AUDIENCE_REWRITE: AudienceRewriteSchema,
  SEGMENT_ALIGNMENT_SCORE: SegmentAlignmentSchema,
  MONETIZATION_OPPORTUNITY_DETECT: MonetizationOpportunitySchema,
  LEAD_MAGNET_SUGGEST: LeadMagnetSchema,
  SERVICE_POSITIONING_ANALYZE: ServicePositioningSchema,
};

const CONTRACT_TO_AGENT: Record<ContractType, string> = {
  STRATEGIC_POSITIONING_ANALYSIS: 'strategy',
  AUTHORITY_ROADMAP_GENERATE: 'strategy',
  CONTENT_GAP_DETECTION: 'strategy',
  ENGAGEMENT_VELOCITY_ANALYSIS: 'performance',
  EARLY_SUCCESS_PREDICT: 'performance',
  PATTERN_ANOMALY_DETECT: 'performance',
  HOOK_CLASSIFY: 'hook',
  HOOK_SCORE: 'hook',
  HOOK_IMPROVE: 'hook',
  RELATIONSHIP_DEPTH_SCORE: 'relationship',
  REENGAGEMENT_SUGGESTION: 'relationship',
  COLLAB_OPPORTUNITY_DETECT: 'relationship',
  REPUTATION_RISK_SCORE: 'reputation',
  CLAIM_VALIDITY_CHECK: 'reputation',
  TONE_ESCALATION_DETECT: 'reputation',
  GROWTH_SIMULATE: 'growth',
  AUTHORITY_PROJECTION: 'growth',
  POST_FREQUENCY_OPTIMIZER: 'growth',
  EXPERIMENT_PLAN_GENERATE: 'experiment',
  VARIANT_COMPARE: 'experiment',
  STATISTICAL_SIGNAL_CHECK: 'experiment',
  KNOWLEDGE_GRAPH_BUILD: 'knowledge',
  INTELLECTUAL_TERRITORY_MAP: 'knowledge',
  TOPIC_EXPANSION_SUGGEST: 'knowledge',
  AUDIENCE_REWRITE: 'persona',
  SEGMENT_ALIGNMENT_SCORE: 'persona',
  MONETIZATION_OPPORTUNITY_DETECT: 'monetization',
  LEAD_MAGNET_SUGGEST: 'monetization',
  SERVICE_POSITIONING_ANALYZE: 'monetization',
};

type HandlerParams = Record<string, unknown>;

function invokeHandler(contractType: ContractType, params: HandlerParams): unknown {
  switch (contractType) {
    case 'STRATEGIC_POSITIONING_ANALYSIS':
      return handlers.handleStrategicPositioning(params as { contentHistory?: string[] });
    case 'AUTHORITY_ROADMAP_GENERATE':
      return handlers.handleAuthorityRoadmap();
    case 'CONTENT_GAP_DETECTION':
      return handlers.handleContentGap(params as { workspaceId?: string });
    case 'ENGAGEMENT_VELOCITY_ANALYSIS':
      return handlers.handleEngagementVelocity(params as { workspaceId?: string });
    case 'EARLY_SUCCESS_PREDICT':
      return handlers.handleEarlySuccessPredict(params as { content: string });
    case 'PATTERN_ANOMALY_DETECT':
      return handlers.handlePatternAnomaly(params as { workspaceId?: string });
    case 'HOOK_CLASSIFY':
      return handlers.handleHookClassify(params as { content: string });
    case 'HOOK_SCORE':
      return handlers.handleHookScore(params as { content: string });
    case 'HOOK_IMPROVE':
      return handlers.handleHookImprove(params as { content: string });
    case 'RELATIONSHIP_DEPTH_SCORE':
      return handlers.handleRelationshipDepth(params as { author: string; comment: string; replyCount?: number });
    case 'REENGAGEMENT_SUGGESTION':
      return handlers.handleReengagementSuggestion(params as { workspaceId?: string });
    case 'COLLAB_OPPORTUNITY_DETECT':
      return handlers.handleCollabOpportunity(params as { workspaceId?: string });
    case 'REPUTATION_RISK_SCORE':
      return handlers.handleReputationRisk(params as { content: string });
    case 'CLAIM_VALIDITY_CHECK':
      return handlers.handleClaimValidity(params as { content: string });
    case 'TONE_ESCALATION_DETECT':
      return handlers.handleToneEscalation(params as { content: string });
    case 'GROWTH_SIMULATE':
      return handlers.handleGrowthSimulate(params as { postsPerWeek?: number; months?: number });
    case 'AUTHORITY_PROJECTION':
      return handlers.handleAuthorityProjection(params as { currentScore?: number; months?: number });
    case 'POST_FREQUENCY_OPTIMIZER':
      return handlers.handlePostFrequencyOptimizer(params as { workspaceId?: string });
    case 'EXPERIMENT_PLAN_GENERATE':
      return handlers.handleExperimentPlan(params as { topic?: string });
    case 'VARIANT_COMPARE':
      return handlers.handleVariantCompare(params as { variantResults?: Array<{ id: string; metric: number }> });
    case 'STATISTICAL_SIGNAL_CHECK':
      return handlers.handleStatisticalSignal(params as { pValue?: number });
    case 'KNOWLEDGE_GRAPH_BUILD':
      return handlers.handleKnowledgeGraph(params as { workspaceId?: string });
    case 'INTELLECTUAL_TERRITORY_MAP':
      return handlers.handleIntellectualTerritory(params as { workspaceId?: string });
    case 'TOPIC_EXPANSION_SUGGEST':
      return handlers.handleTopicExpansion(params as { workspaceId?: string });
    case 'AUDIENCE_REWRITE':
      return handlers.handleAudienceRewrite(params as { content: string; audience: 'recruiters' | 'operators' | 'founders' | 'students' });
    case 'SEGMENT_ALIGNMENT_SCORE':
      return handlers.handleSegmentAlignment(params as { content: string });
    case 'MONETIZATION_OPPORTUNITY_DETECT':
      return handlers.handleMonetizationOpportunity(params as { workspaceId?: string });
    case 'LEAD_MAGNET_SUGGEST':
      return handlers.handleLeadMagnet(params as { workspaceId?: string });
    case 'SERVICE_POSITIONING_ANALYZE':
      return handlers.handleServicePositioning(params as { workspaceId?: string });
    default:
      throw new Error(`Unknown contract type: ${contractType}`);
  }
}

export const AgentRegistry = {
  strategy: {
    name: 'Strategy Agent',
    contracts: ['STRATEGIC_POSITIONING_ANALYSIS', 'AUTHORITY_ROADMAP_GENERATE', 'CONTENT_GAP_DETECTION'] as ContractType[],
  },
  performance: {
    name: 'Performance Agent',
    contracts: ['ENGAGEMENT_VELOCITY_ANALYSIS', 'EARLY_SUCCESS_PREDICT', 'PATTERN_ANOMALY_DETECT'] as ContractType[],
  },
  hook: {
    name: 'Hook Intelligence Agent',
    contracts: ['HOOK_CLASSIFY', 'HOOK_SCORE', 'HOOK_IMPROVE'] as ContractType[],
  },
  relationship: {
    name: 'Relationship Agent',
    contracts: ['RELATIONSHIP_DEPTH_SCORE', 'REENGAGEMENT_SUGGESTION', 'COLLAB_OPPORTUNITY_DETECT'] as ContractType[],
  },
  reputation: {
    name: 'Reputation Risk Agent',
    contracts: ['REPUTATION_RISK_SCORE', 'CLAIM_VALIDITY_CHECK', 'TONE_ESCALATION_DETECT'] as ContractType[],
  },
  growth: {
    name: 'Growth Simulation Agent',
    contracts: ['GROWTH_SIMULATE', 'AUTHORITY_PROJECTION', 'POST_FREQUENCY_OPTIMIZER'] as ContractType[],
  },
  experiment: {
    name: 'Experimentation Agent',
    contracts: ['EXPERIMENT_PLAN_GENERATE', 'VARIANT_COMPARE', 'STATISTICAL_SIGNAL_CHECK'] as ContractType[],
  },
  knowledge: {
    name: 'Knowledge Graph Agent',
    contracts: ['KNOWLEDGE_GRAPH_BUILD', 'INTELLECTUAL_TERRITORY_MAP', 'TOPIC_EXPANSION_SUGGEST'] as ContractType[],
  },
  persona: {
    name: 'Persona Adaptation Agent',
    contracts: ['AUDIENCE_REWRITE', 'SEGMENT_ALIGNMENT_SCORE'] as ContractType[],
  },
  monetization: {
    name: 'Content Monetization Agent',
    contracts: ['MONETIZATION_OPPORTUNITY_DETECT', 'LEAD_MAGNET_SUGGEST', 'SERVICE_POSITIONING_ANALYZE'] as ContractType[],
  },
} as const;

export function getSchemaForContract(contractType: ContractType): z.ZodSchema {
  const schema = CONTRACT_SCHEMAS[contractType];
  if (!schema) throw new Error(`No schema for contract: ${contractType}`);
  return schema;
}

export function getAgentForContract(contractType: ContractType): string {
  return CONTRACT_TO_AGENT[contractType] ?? 'unknown';
}

export function executeContract(contractType: ContractType, params: HandlerParams): unknown {
  return invokeHandler(contractType, params);
}
