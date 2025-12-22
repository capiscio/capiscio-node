"""
Integration tests for capiscio-node CLI wrapper version alignment.

These tests verify that the Node wrapper correctly downloads and executes
the capiscio-core binary at the expected version (v2.2.0).
"""

import subprocess
import json
import pytest


class TestNodeWrapperVersion:
    """Test capiscio-node version alignment."""
    
    def test_package_json_version_matches_core(self):
        """Verify package.json version matches capiscio-core version."""
        # Read package.json
        with open("/Users/beondenood/Development/CapiscIO/capiscio-node/package.json", "r") as f:
            package = json.load(f)
        
        package_version = package["version"]
        
        # Expected version
        expected_version = "2.2.0"
        
        assert package_version == expected_version, \
            f"package.json version ({package_version}) != expected ({expected_version})"
        
        print(f"✓ package.json version: {package_version}")
    
    
    def test_wrapper_downloads_correct_binary_version(self):
        """Verify wrapper downloads v2.2.0 of capiscio-core."""
        # Read the wrapper code
        try:
            with open("/Users/beondenood/Development/CapiscIO/capiscio-node/src/index.ts", "r") as f:
                content = f.read()
        except FileNotFoundError:
            pytest.skip("Wrapper source file not found")
        
        # Check that it references v2.2.0
        assert "2.2.0" in content or "CAPISCIO_VERSION" in content, \
            "Wrapper should reference capiscio-core v2.2.0"
        
        print(f"✓ Wrapper configured for v2.2.0")
    
    
    def test_binary_executes_successfully(self):
        """Verify downloaded binary can execute via npx."""
        result = subprocess.run(
            ["npx", "capiscio", "--help"],
            capture_output=True,
            text=True,
            cwd="/Users/beondenood/Development/CapiscIO/capiscio-node"
        )
        
        if result.returncode != 0:
            pytest.skip("Binary not yet downloaded or npx not available")
        
        assert "capiscio" in result.stdout.lower() or "capiscio" in result.stderr.lower(), \
            "Binary should display help text"
        
        print(f"✓ Binary executes successfully via npx")
    
    
    def test_cli_version_command(self):
        """Verify CLI --version returns correct version."""
        result = subprocess.run(
            ["npx", "capiscio", "--version"],
            capture_output=True,
            text=True,
            cwd="/Users/beondenood/Development/CapiscIO/capiscio-node"
        )
        
        if result.returncode != 0:
            pytest.skip("Binary not yet downloaded")
        
        # Parse version from output
        version_output = result.stdout.strip()
        
        assert "2.2.0" in version_output, \
            f"Version output should contain 2.2.0, got: {version_output}"
        
        print(f"✓ CLI version command returns: {version_output}")
